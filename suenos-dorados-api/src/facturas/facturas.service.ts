import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// ── Paleta de colores ────────────────────────────────────────────────────────
const NEGRO    = '#000000';
const GRIS_OSC = '#333333';
const GRIS_MED = '#666666';
const GRIS_SUA = '#999999';
const BORDE    = '#BBBBBB';
const FONDO    = '#F5F5F5';
const AMARILLO = '#F5C518';

/** Convierte número a letras en español (simplificado para COP) */
function numeroALetras(n: number): string {
  const num = Math.round(n);
  if (num === 0) return 'CERO PESOS M/CTE';
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function grupo(n: number): string {
    let s = '';
    if (n === 100) return 'CIEN';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    if (c > 0) s += centenas[c] + ' ';
    if (d === 1) { s += unidades[10 + u]; return s.trim(); }
    if (d === 2 && u > 0) { s += 'VEINTI' + unidades[u]; return s.trim(); }
    if (d >= 2) s += decenas[d] + (u > 0 ? ' Y ' : '');
    if (u > 0) s += unidades[u];
    return s.trim();
  }

  const millones = Math.floor(num / 1_000_000);
  const miles    = Math.floor((num % 1_000_000) / 1_000);
  const resto    = num % 1_000;
  let resultado  = '';

  if (millones > 0) resultado += (millones === 1 ? 'UN MILLÓN ' : grupo(millones) + ' MILLONES ');
  if (miles    > 0) resultado += (miles    === 1 ? 'MIL '       : grupo(miles)    + ' MIL ');
  if (resto    > 0) resultado += grupo(resto);

  return resultado.trim() + ' PESOS M/CTE';
}

@Injectable()
export class FacturasService {
  constructor(private readonly dataSource: DataSource) {}

  async generarPDF(idPedido: number, idUsuario: number, res: Response): Promise<void> {

    // ── 1. Datos del pedido ───────────────────────────────────────────────────
    const rows = await this.dataSource.query(`
      SELECT
        p.id_pedido, p.fecha_pedido,
        p.subtotal, p.descuento, p.costo_envio, p.total,
        p.base_imponible, p.iva,
        ep.descripcion_estado AS estado,
        u.nombre_usuario, u.apellido_usuario,
        u.correo_electronico, u.telefono,
        d.descripcion_direccion, d.descripcion_barrio,
        d.descripcion_municipio, d.descripcion_departamento,
        COALESCE(d.pais,'Colombia')   AS pais,
        d.nombre_destinatario, d.telefono_contacto,
        ce.nombre   AS empresa_nombre,
        ce.nit      AS empresa_nit,
        ce.telefono AS empresa_telefono,
        ce.direccion AS empresa_direccion,
        ce.ciudad   AS empresa_ciudad,
        ce.email    AS empresa_email
      FROM pedidos p
      LEFT JOIN estado_pedido ep ON ep.id_estado_pedido = p.id_estado_pedido
      LEFT JOIN usuarios      u  ON u.id_usuario        = p.id_usuario
      LEFT JOIN direcciones   d  ON d.id_direccion      = p.id_direccion
      LEFT JOIN configuracion_empresa ce ON ce.id = 1
      WHERE p.id_pedido = $1 AND p.id_usuario = $2
    `, [idPedido, idUsuario]);

    if (!rows.length) throw new NotFoundException(`Pedido ${idPedido} no encontrado`);
    const P = rows[0];

    // ── 2. Ítems del pedido ───────────────────────────────────────────────────
    const items = await this.dataSource.query(`
      SELECT
        dp.cantidad, dp.precio_unitario,
        dp.iva_porcentaje, dp.base_unitario, dp.iva_unitario,
        (dp.cantidad * dp.precio_unitario) AS subtotal_item,
        (dp.cantidad * dp.base_unitario)   AS base_item,
        (dp.cantidad * dp.iva_unitario)    AS iva_item,
        vp.sku, vp.referencia,
        pr.nombre_producto,
        m.nombre_medida, c.nombre_color
      FROM detalle_pedido dp
      LEFT JOIN variantes_producto vp ON vp.id_variante = dp.id_variante
      LEFT JOIN productos pr ON pr.id_producto = vp.id_producto
      LEFT JOIN medidas m ON m.id_medida = vp.id_medida
      LEFT JOIN colores c ON c.id_color = vp.id_color
      WHERE dp.id_pedido = $1
    `, [idPedido]);

    // ── 3. Configurar respuesta HTTP ──────────────────────────────────────────
    const fileName = `Factura-SD-${String(idPedido).padStart(6, '0')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // ── 4. Crear documento ────────────────────────────────────────────────────
    const doc = new PDFDocument({ size: 'A4', margin: 40, compress: true });
    doc.pipe(res);

    const PW = doc.page.width;   // 595
    const PH = doc.page.height;  // 842
    const ML = 40;               // margen izquierdo
    const MR = PW - 40;         // margen derecho
    const W  = MR - ML;         // ancho útil

    const fmtCOP = (v: number) => `$ ${Math.round(v).toLocaleString('es-CO')}`;
    const fmtFecha = (d: string) =>
      new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

    let y = ML;

    // ── ENCABEZADO ────────────────────────────────────────────────────────────

    // Rectángulo exterior del encabezado
    doc.rect(ML, y, W, 110).lineWidth(0.5).stroke(BORDE);

    // Columna izquierda: logo
    const logoPath = path.join(process.cwd(), 'uploads', 'productos', 'suenos_dorados-9295ab3c.jpeg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, ML + 6, y + 6, { width: 98, height: 98, fit: [98, 98] });
    }

    // Columna centro: datos empresa
    const cx = ML + 110;
    doc
      .font('Helvetica-Bold').fontSize(12).fillColor(NEGRO)
      .text((P.empresa_nombre ?? 'SUEÑOS DORADOS').toUpperCase(), cx, y + 10, { width: W - 230, align: 'center' });
    doc
      .font('Helvetica').fontSize(8).fillColor(GRIS_OSC)
      .text(`NIT : ${P.empresa_nit ?? '900.000.000-1'}`, cx, y + 26, { width: W - 230, align: 'center' })
      .text(P.empresa_direccion ?? 'Calle 10 # 25-40', cx, y + 38, { width: W - 230, align: 'center' })
      .text(`${P.empresa_ciudad ?? 'Cali'} - COLOMBIA`, cx, y + 50, { width: W - 230, align: 'center' })
      .text(`Tel: ${P.empresa_telefono ?? '300 000 0000'}`, cx, y + 62, { width: W - 230, align: 'center' })
      .text(P.empresa_email ?? 'contacto@suenosdorados.co', cx, y + 74, { width: W - 230, align: 'center' })
      .text('Responsables de IVA', cx, y + 86, { width: W - 230, align: 'center' })
      .text('Régimen Común', cx, y + 98, { width: W - 230, align: 'center' });

    // Columna derecha: caja FACTURA DE VENTA
    const rx = MR - 150;
    doc.rect(rx, y, 150, 110).lineWidth(0.5).stroke(BORDE);
    doc
      .font('Helvetica-Bold').fontSize(9).fillColor(NEGRO)
      .text('FACTURA DE VENTA', rx, y + 10, { width: 150, align: 'center' });
    doc
      .font('Helvetica-Bold').fontSize(13).fillColor(NEGRO)
      .text(`No. ${String(idPedido).padStart(6, '0')}`, rx, y + 26, { width: 150, align: 'center' });

    // Línea divisoria
    doc.moveTo(rx, y + 45).lineTo(rx + 150, y + 45).lineWidth(0.5).stroke(BORDE);

    doc
      .font('Helvetica').fontSize(7.5).fillColor(GRIS_OSC)
      .text('Fecha y Hora de Factura', rx + 6, y + 50)
      .text(`${fmtFecha(P.fecha_pedido)}  ${new Date(P.fecha_pedido).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, rx + 6, y + 62)
      .text('Estado:', rx + 6, y + 76)
      .text(P.estado ?? 'Pendiente', rx + 6, y + 88);

    y += 118;

    // ── DATOS DEL CLIENTE ─────────────────────────────────────────────────────
    const clienteH = 70;
    doc.rect(ML, y, W, clienteH).lineWidth(0.5).stroke(BORDE);

    // Fila 1
    doc
      .font('Helvetica-Bold').fontSize(7.5).fillColor(NEGRO)
      .text('Cliente', ML + 4, y + 6)
      .font('Helvetica').fillColor(GRIS_OSC)
      .text(`${P.nombre_usuario} ${P.apellido_usuario}`, ML + 52, y + 6);

    doc
      .font('Helvetica-Bold').fillColor(NEGRO)
      .text('Teléfono', ML + W / 2 + 4, y + 6)
      .font('Helvetica').fillColor(GRIS_OSC)
      .text(P.telefono ?? P.telefono_contacto ?? '—', ML + W / 2 + 58, y + 6);

    // Fila 2
    doc
      .font('Helvetica-Bold').fillColor(NEGRO)
      .text('Correo', ML + 4, y + 20)
      .font('Helvetica').fillColor(GRIS_OSC)
      .text(P.correo_electronico ?? '—', ML + 52, y + 20);

    doc
      .font('Helvetica-Bold').fillColor(NEGRO)
      .text('Destinatario', ML + W / 2 + 4, y + 20)
      .font('Helvetica').fillColor(GRIS_OSC)
      .text(P.nombre_destinatario ?? `${P.nombre_usuario} ${P.apellido_usuario}`, ML + W / 2 + 70, y + 20);

    // Fila 3
    doc
      .font('Helvetica-Bold').fillColor(NEGRO)
      .text('Dirección', ML + 4, y + 34)
      .font('Helvetica').fillColor(GRIS_OSC)
      .text(P.descripcion_direccion ?? '—', ML + 52, y + 34);

    // Fila 4
    doc
      .font('Helvetica-Bold').fillColor(NEGRO)
      .text('Ciudad', ML + 4, y + 48)
      .font('Helvetica').fillColor(GRIS_OSC)
      .text(
        [P.descripcion_barrio, P.descripcion_municipio, P.descripcion_departamento, P.pais]
          .filter(Boolean).join(' - '),
        ML + 52, y + 48,
      );

    y += clienteH + 8;

    // ── TABLA DE ÍTEMS ────────────────────────────────────────────────────────

    // Encabezado de tabla
    const colCod  = ML;
    const colDesc = ML + 90;
    const colUnd  = ML + W * 0.58;
    const colCant = ML + W * 0.66;
    const colVUnit = ML + W * 0.76;
    const colTotal = ML + W * 0.88;

    doc.rect(ML, y, W, 18).fill(FONDO).stroke(BORDE);
    doc.rect(ML, y, W, 18).lineWidth(0.5).stroke(BORDE);

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(NEGRO);
    doc.text('Código / SKU',  colCod  + 3, y + 5, { width: 84 });
    doc.text('Descripción',   colDesc + 3, y + 5, { width: colUnd - colDesc - 6 });
    doc.text('Und',           colUnd  + 3, y + 5, { width: 30, align: 'center' });
    doc.text('Cant',          colCant + 3, y + 5, { width: 30, align: 'center' });
    doc.text('V. Unit',       colVUnit + 3, y + 5, { width: 60, align: 'right' });
    doc.text('Valor Total',   colTotal + 3, y + 5, { width: MR - colTotal - 3, align: 'right' });

    y += 18;

    // Filas de ítems
    let baseTotalItems = 0;
    let ivaTotalItems  = 0;

    for (let i = 0; i < items.length; i++) {
      const item    = items[i];
      const rowH    = 22;
      const bgColor = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA';

      doc.rect(ML, y, W, rowH).fill(bgColor);
      doc.rect(ML, y, W, rowH).lineWidth(0.3).stroke(BORDE);

      // Líneas verticales
      for (const x of [colDesc, colUnd, colCant, colVUnit, colTotal]) {
        doc.moveTo(x, y).lineTo(x, y + rowH).lineWidth(0.3).stroke(BORDE);
      }

      const nombre = [
        item.nombre_producto,
        item.nombre_medida && item.nombre_medida !== 'Sin especificar' ? item.nombre_medida : '',
        item.nombre_color  && item.nombre_color  !== 'Sin especificar' ? item.nombre_color  : '',
      ].filter(Boolean).join(' · ');

      doc.font('Helvetica').fontSize(7.5).fillColor(GRIS_OSC);
      doc.text(item.sku ?? '—',                                 colCod   + 3, y + 6, { width: 84, ellipsis: true });
      doc.text(nombre,                                           colDesc  + 3, y + 6, { width: colUnd - colDesc - 6, ellipsis: true });
      doc.text('UN',                                             colUnd   + 3, y + 6, { width: 30, align: 'center' });
      doc.text(String(item.cantidad),                            colCant  + 3, y + 6, { width: 30, align: 'center' });
      doc.text(fmtCOP(Number(item.precio_unitario)),             colVUnit + 3, y + 6, { width: 60, align: 'right' });
      doc.text(fmtCOP(Number(item.subtotal_item)),               colTotal + 3, y + 6, { width: MR - colTotal - 3, align: 'right' });

      baseTotalItems += Number(item.base_item);
      ivaTotalItems  += Number(item.iva_item);
      y += rowH;

      if (y > PH - 200) { doc.addPage(); y = 40; }
    }

    y += 6;

    // ── TOTALES ───────────────────────────────────────────────────────────────
    const totW   = 200;
    const totX   = MR - totW;
    const totH   = 18;

    const totales: [string, number, boolean?][] = [
      ['Total Bruto (Base IVA)', Number(P.base_imponible || baseTotalItems)],
      ['IVA (19%)',              Number(P.iva            || ivaTotalItems)],
    ];

    if (Number(P.descuento) > 0) {
      totales.push(['Descuento', -Number(P.descuento)]);
    }
    if (Number(P.costo_envio) > 0) {
      totales.push(['Costo de envío', Number(P.costo_envio)]);
    }

    for (const [label, valor] of totales) {
      doc.rect(totX, y, totW, totH).fill('#FAFAFA').stroke(BORDE);
      doc.moveTo(totX + totW * 0.55, y).lineTo(totX + totW * 0.55, y + totH).lineWidth(0.3).stroke(BORDE);
      doc.font('Helvetica').fontSize(7.5).fillColor(GRIS_OSC)
        .text(label, totX + 4, y + 5, { width: totW * 0.55 - 8 })
        .text(fmtCOP(Math.abs(Math.round(valor))), totX + totW * 0.55 + 3, y + 5, { width: totW * 0.44, align: 'right' });
      y += totH;
    }

    // Fila TOTAL A PAGAR — destacada
    doc.rect(totX, y, totW, 22).fill(AMARILLO).stroke(BORDE);
    doc.moveTo(totX + totW * 0.55, y).lineTo(totX + totW * 0.55, y + 22).lineWidth(0.3).stroke(BORDE);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(NEGRO)
      .text('Total a Pagar', totX + 4, y + 7, { width: totW * 0.55 - 8 })
      .text(fmtCOP(Number(P.total)), totX + totW * 0.55 + 3, y + 7, { width: totW * 0.44, align: 'right' });
    y += 26;

    // ── VALOR EN LETRAS ───────────────────────────────────────────────────────
    y += 4;
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(NEGRO).text('VALOR EN LETRAS', ML, y);
    y += 11;
    doc.font('Helvetica').fontSize(7.5).fillColor(GRIS_OSC)
      .text(numeroALetras(Number(P.total)), ML, y, { width: W });
    y += 16;

    // ── OBSERVACIONES ─────────────────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(NEGRO).text('OBSERVACIONES', ML, y);
    y += 11;
    doc.font('Helvetica').fontSize(7.5).fillColor(GRIS_OSC)
      .text('Gracias por su compra en Sueños Dorados. Este documento es soporte de venta.', ML, y, { width: W });
    y += 24;

    // ── LÍNEAS DE FIRMA ───────────────────────────────────────────────────────
    const midX = ML + W / 2;
    doc.moveTo(ML + 20, y).lineTo(midX - 20, y).lineWidth(0.5).stroke(BORDE);
    doc.moveTo(midX + 20, y).lineTo(MR - 20, y).lineWidth(0.5).stroke(BORDE);
    y += 6;
    doc.font('Helvetica').fontSize(7).fillColor(GRIS_MED)
      .text('Firma Elaborado por: VENDEDOR', ML + 20, y)
      .text('Firma Recibido', midX + 20, y);

    y += 18;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(NEGRO)
      .text('Gracias por preferirnos', ML, y, { width: W, align: 'center' });

    y += 20;

    // ── NOTA LEGAL (caja con borde naranja como en el modelo) ─────────────────
    const notaH = 38;
    doc.rect(ML, y, W, notaH).lineWidth(1).strokeColor('#E8720C').stroke();
    doc.font('Helvetica').fontSize(6.5).fillColor(GRIS_OSC)
      .text(
        'A esta factura de venta aplican las normas del Estatuto Tributario Colombiano. ' +
        'Con este documento el Comprador declara haber recibido real y materialmente las ' +
        'mercancías o prestación de servicios descritos. Los precios incluyen IVA del 19%. ' +
        `Factura No. ${String(idPedido).padStart(6, '0')} — ${fmtFecha(P.fecha_pedido)}.`,
        ML + 5, y + 6,
        { width: W - 10, lineGap: 2 },
      );

    y += notaH + 10;

    // ── PIE DE PÁGINA ─────────────────────────────────────────────────────────
    doc.font('Helvetica').fontSize(7).fillColor(GRIS_SUA)
      .text(`Página 1 de 1`, ML, y, { width: W, align: 'right' });
    doc.text('ORIGINAL', ML, y, { width: W / 2, align: 'left' });

    doc.end();
  }
}
