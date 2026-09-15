import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import type { Response } from 'express';

// ── Colores de marca ────────────────────────────────────────────────────────
const NARANJA  = '#E8720C';
const GRIS     = '#6B7280';
const NEGRO    = '#111827';
const LINEA    = '#E5E7EB';
const FONDO    = '#FFF8ED';

@Injectable()
export class FacturasService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Genera el PDF de la factura de un pedido y lo escribe directamente
   * en el Response de Express (streaming — no se guarda en disco).
   */
  async generarPDF(idPedido: number, idUsuario: number, res: Response): Promise<void> {
    // ── 1. Obtener datos del pedido ────────────────────────────────────────
    const rows = await this.dataSource.query(`
      SELECT
        p.id_pedido,
        p.fecha_pedido,
        p.subtotal,
        p.descuento,
        p.costo_envio,
        p.total,
        p.base_imponible,
        p.iva,
        ep.descripcion_estado AS estado,

        u.nombre_usuario,
        u.apellido_usuario,
        u.correo_electronico,
        u.telefono,

        d.descripcion_direccion,
        d.descripcion_barrio,
        d.descripcion_municipio,
        d.descripcion_departamento,
        COALESCE(d.pais, 'Colombia') AS pais,
        d.nombre_destinatario,
        d.telefono_contacto,

        ce.nombre         AS empresa_nombre,
        ce.nit            AS empresa_nit,
        ce.telefono       AS empresa_telefono,
        ce.direccion      AS empresa_direccion,
        ce.ciudad         AS empresa_ciudad,
        ce.email          AS empresa_email

      FROM pedidos p
      LEFT JOIN estado_pedido      ep ON ep.id_estado_pedido = p.id_estado_pedido
      LEFT JOIN usuarios           u  ON u.id_usuario        = p.id_usuario
      LEFT JOIN direcciones        d  ON d.id_direccion      = p.id_direccion
      LEFT JOIN configuracion_empresa ce ON ce.id = 1
      WHERE p.id_pedido = $1 AND p.id_usuario = $2
    `, [idPedido, idUsuario]);

    if (!rows.length) throw new NotFoundException(`Pedido ${idPedido} no encontrado`);
    const pedido = rows[0];

    // ── 2. Obtener ítems del pedido ────────────────────────────────────────
    const items = await this.dataSource.query(`
      SELECT
        dp.cantidad,
        dp.precio_unitario,
        dp.iva_porcentaje,
        dp.base_unitario,
        dp.iva_unitario,
        (dp.cantidad * dp.precio_unitario)  AS subtotal_item,
        (dp.cantidad * dp.base_unitario)    AS base_item,
        (dp.cantidad * dp.iva_unitario)     AS iva_item,
        vp.sku,
        vp.referencia,
        pr.nombre_producto,
        m.nombre_medida,
        c.nombre_color
      FROM detalle_pedido dp
      LEFT JOIN variantes_producto vp ON vp.id_variante = dp.id_variante
      LEFT JOIN productos          pr ON pr.id_producto  = vp.id_producto
      LEFT JOIN medidas            m  ON m.id_medida     = vp.id_medida
      LEFT JOIN colores            c  ON c.id_color      = vp.id_color
      WHERE dp.id_pedido = $1
    `, [idPedido]);

    // ── 3. Preparar respuesta HTTP ─────────────────────────────────────────
    const fileName = `Factura-SD-${String(idPedido).padStart(6, '0')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // ── 4. Construir PDF ───────────────────────────────────────────────────
    const doc = new PDFDocument({
      size:   'A4',
      margin: 50,
      info: {
        Title:   `Factura #${idPedido} — Sueños Dorados`,
        Author:  pedido.empresa_nombre ?? 'Sueños Dorados',
        Subject: `Pedido ORD-${String(idPedido).padStart(6, '0')}`,
      },
    });

    doc.pipe(res);

    const W   = doc.page.width  - 100; // ancho útil
    const M   = 50;                     // margen izquierdo

    // ── ENCABEZADO ──────────────────────────────────────────────────────────
    // Banda naranja
    doc.rect(0, 0, doc.page.width, 90).fill(NARANJA);

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#FFFFFF')
      .text(pedido.empresa_nombre ?? 'Sueños Dorados', M, 22);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('rgba(255,255,255,0.85)')
      .text(
        [
          pedido.empresa_nit      ? `NIT: ${pedido.empresa_nit}`    : '',
          pedido.empresa_email    ? pedido.empresa_email             : '',
          pedido.empresa_telefono ? `Tel: ${pedido.empresa_telefono}`: '',
          pedido.empresa_ciudad   ? pedido.empresa_ciudad            : 'Cali, Colombia',
        ].filter(Boolean).join('  ·  '),
        M, 50,
      );

    // Número de factura (alineado a la derecha)
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#FFFFFF')
      .text(
        `FACTURA #${String(idPedido).padStart(6, '0')}`,
        M, 22,
        { width: W, align: 'right' },
      );

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('rgba(255,255,255,0.85)')
      .text(
        `Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        M, 42,
        { width: W, align: 'right' },
      )
      .text(
        `Estado: ${pedido.estado ?? 'Pendiente'}`,
        M, 55,
        { width: W, align: 'right' },
      );

    let y = 110;

    // ── DATOS DEL CLIENTE Y ENTREGA ────────────────────────────────────────
    const colW = W / 2 - 10;

    // Caja cliente
    doc.rect(M, y, colW, 90).fill(FONDO).stroke(LINEA);
    doc
      .font('Helvetica-Bold').fontSize(9).fillColor(NARANJA)
      .text('DATOS DEL CLIENTE', M + 10, y + 10);
    doc
      .font('Helvetica').fontSize(9).fillColor(NEGRO)
      .text(`${pedido.nombre_usuario} ${pedido.apellido_usuario}`, M + 10, y + 24)
      .text(pedido.correo_electronico ?? '',                        M + 10, y + 37)
      .text(pedido.telefono           ? `Tel: ${pedido.telefono}` : '', M + 10, y + 50);

    // Caja entrega
    const cx2 = M + colW + 20;
    doc.rect(cx2, y, colW, 90).fill(FONDO).stroke(LINEA);
    doc
      .font('Helvetica-Bold').fontSize(9).fillColor(NARANJA)
      .text('DIRECCIÓN DE ENTREGA', cx2 + 10, y + 10);
    doc
      .font('Helvetica').fontSize(9).fillColor(NEGRO)
      .text(pedido.nombre_destinatario  ?? `${pedido.nombre_usuario} ${pedido.apellido_usuario}`, cx2 + 10, y + 24)
      .text(pedido.descripcion_direccion ?? '',                                                    cx2 + 10, y + 37)
      .text(
        [pedido.descripcion_barrio, pedido.descripcion_municipio, pedido.descripcion_departamento]
          .filter(Boolean).join(', '),
        cx2 + 10, y + 50,
      )
      .text(pedido.pais ?? 'Colombia', cx2 + 10, y + 63);

    y += 108;

    // ── TABLA DE PRODUCTOS ─────────────────────────────────────────────────
    // Encabezado tabla
    doc.rect(M, y, W, 22).fill(NARANJA);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');

    const cols = {
      producto: { x: M + 6,       w: W * 0.38 },
      ref:      { x: M + W * 0.40, w: W * 0.14 },
      qty:      { x: M + W * 0.56, w: W * 0.08 },
      base:     { x: M + W * 0.65, w: W * 0.12 },
      iva:      { x: M + W * 0.78, w: W * 0.10 },
      total:    { x: M + W * 0.89, w: W * 0.11 },
    };

    doc.text('PRODUCTO',        cols.producto.x, y + 7);
    doc.text('REF / SKU',       cols.ref.x,      y + 7);
    doc.text('CANT',            cols.qty.x,      y + 7);
    doc.text('BASE',            cols.base.x,     y + 7, { width: cols.base.w, align: 'right' });
    doc.text('IVA',             cols.iva.x,      y + 7, { width: cols.iva.w,  align: 'right' });
    doc.text('TOTAL',           cols.total.x,    y + 7, { width: cols.total.w,align: 'right' });

    y += 22;

    // Filas
    for (let i = 0; i < items.length; i++) {
      const item    = items[i];
      const bgColor = i % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
      const rowH    = 28;

      doc.rect(M, y, W, rowH).fill(bgColor).stroke(LINEA);

      const nombre = [
        item.nombre_producto,
        item.nombre_medida && item.nombre_medida !== 'Sin especificar' ? item.nombre_medida : '',
        item.nombre_color  && item.nombre_color  !== 'Sin especificar' ? item.nombre_color  : '',
      ].filter(Boolean).join(' · ');

      doc.font('Helvetica').fontSize(8).fillColor(NEGRO);
      doc.text(nombre,               cols.producto.x, y + 9, { width: cols.producto.w - 4, ellipsis: true });
      doc.text(item.sku ?? item.referencia ?? '', cols.ref.x, y + 9, { width: cols.ref.w });
      doc.text(String(item.cantidad), cols.qty.x, y + 9);
      doc.text(
        `$${Math.round(Number(item.base_item)).toLocaleString('es-CO')}`,
        cols.base.x, y + 9, { width: cols.base.w, align: 'right' },
      );
      doc.text(
        `$${Math.round(Number(item.iva_item)).toLocaleString('es-CO')}`,
        cols.iva.x, y + 9, { width: cols.iva.w, align: 'right' },
      );
      doc.text(
        `$${Math.round(Number(item.subtotal_item)).toLocaleString('es-CO')}`,
        cols.total.x, y + 9, { width: cols.total.w, align: 'right' },
      );

      y += rowH;

      // Salto de página si es necesario
      if (y > doc.page.height - 180) {
        doc.addPage();
        y = 50;
      }
    }

    y += 10;

    // ── RESUMEN FINANCIERO ─────────────────────────────────────────────────
    const resW   = 220;
    const resX   = M + W - resW;
    const lineH  = 20;

    const lineas: [string, number, boolean?][] = [
      ['Subtotal (con IVA)',       Number(pedido.subtotal)],
      ['Base imponible',           Number(pedido.base_imponible || (Number(pedido.subtotal) / 1.19))],
      ['IVA (19%)',                Number(pedido.iva           || (Number(pedido.subtotal) - Number(pedido.subtotal) / 1.19))],
      ['Descuento',               -Number(pedido.descuento)],
      ['Costo de envío',           Number(pedido.costo_envio)],
    ];

    for (const [label, valor] of lineas) {
      doc.rect(resX, y, resW, lineH).fill('#F9FAFB').stroke(LINEA);
      doc
        .font('Helvetica').fontSize(9).fillColor(GRIS)
        .text(label,                         resX + 10, y + 5);
      doc
        .font('Helvetica').fontSize(9).fillColor(NEGRO)
        .text(
          `$${Math.abs(Math.round(valor)).toLocaleString('es-CO')}`,
          resX, y + 5,
          { width: resW - 10, align: 'right' },
        );
      y += lineH;
    }

    // Línea total
    doc.rect(resX, y, resW, 28).fill(NARANJA);
    doc
      .font('Helvetica-Bold').fontSize(11).fillColor('#FFFFFF')
      .text('TOTAL',                         resX + 10, y + 7)
      .text(
        `$${Math.round(Number(pedido.total)).toLocaleString('es-CO')}`,
        resX, y + 7,
        { width: resW - 10, align: 'right' },
      );

    y += 50;

    // ── NOTA IVA ────────────────────────────────────────────────────────────
    doc
      .font('Helvetica-Oblique').fontSize(8).fillColor(GRIS)
      .text(
        'Los precios incluyen IVA del 19%. Este documento sirve como soporte de compra.',
        M, y,
        { width: W },
      );

    // ── PIE DE PÁGINA ───────────────────────────────────────────────────────
    const pageH = doc.page.height;
    doc.rect(0, pageH - 40, doc.page.width, 40).fill(NARANJA);
    doc
      .font('Helvetica').fontSize(8).fillColor('#FFFFFF')
      .text(
        `${pedido.empresa_nombre ?? 'Sueños Dorados'}  ·  ${pedido.empresa_email ?? ''}  ·  ${pedido.empresa_ciudad ?? 'Cali, Colombia'}`,
        M, pageH - 26,
        { width: W, align: 'center' },
      );

    doc.end();
  }
}
