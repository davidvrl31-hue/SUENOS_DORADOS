import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  /** Lista todos los usuarios sin exponer el hash de contraseña */
  async findAll(): Promise<Omit<Usuario, 'contrasenaHash'>[]> {
    const usuarios = await this.usuariosRepository.find({
      order: { idUsuario: 'ASC' },
    });
    return usuarios.map(({ contrasenaHash: _h, ...u }) => u);
  }

  async findOne(id: number): Promise<Omit<Usuario, 'contrasenaHash'>> {
    const usuario = await this.usuariosRepository.findOne({ where: { idUsuario: id } });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    const { contrasenaHash: _h, ...u } = usuario;
    return u;
  }

  async update(
    id: number,
    datos: { nombreUsuario?: string; apellidoUsuario?: string; telefono?: string; estado?: boolean },
  ): Promise<Omit<Usuario, 'contrasenaHash'>> {
    await this.findOne(id); // valida que exista
    await this.usuariosRepository.update(id, datos);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // valida que exista
    await this.usuariosRepository.delete(id);
  }

  // ── Sincronización de Carrito en la Base de Datos ──
  async getCarrito(idUsuario: number) {
    const rows = await this.dataSource.query(`
      SELECT 
        p.id_producto AS id,
        p.nombre_producto AS name,
        v.precio AS price,
        c.cantidad AS quantity,
        COALESCE(img.url_imagen, '') AS image,
        cat.nombre_categoria AS category,
        p.slug AS slug,
        v.id_variante AS "idVariante",
        v.sku AS sku
      FROM carrito c
      JOIN variantes_producto v ON c.id_variante = v.id_variante
      JOIN productos p ON v.id_producto = p.id_producto
      JOIN categorias cat ON p.id_categoria = cat.id_categoria
      LEFT JOIN imagenes_producto img ON p.id_producto = img.id_producto AND img.es_principal = true
      WHERE c.id_usuario = $1
    `, [idUsuario]);
    
    return rows.map(r => ({
      ...r,
      price: Number(r.price),
      quantity: Number(r.quantity),
      id: Number(r.id),
      idVariante: Number(r.idVariante)
    }));
  }

  async guardarCarrito(idUsuario: number, items: { idVariante: number; quantity: number }[]) {
    // DELETE + INSERT atómico dentro de una transacción
    // para evitar condiciones de carrera entre dispositivos
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`DELETE FROM carrito WHERE id_usuario = $1`, [idUsuario]);

      for (const item of items) {
        if (item.idVariante > 0 && item.quantity > 0) {
          // Verificar que la variante existe y respetar el stock real
          const [variante] = await manager.query(
            `SELECT stock FROM variantes_producto WHERE id_variante = $1 AND estado = true`,
            [item.idVariante],
          );
          if (!variante) continue;
          const cantidadReal = Math.min(item.quantity, Number(variante.stock));
          if (cantidadReal <= 0) continue;

          await manager.query(
            `INSERT INTO carrito (id_usuario, id_variante, cantidad)
             VALUES ($1, $2, $3)
             ON CONFLICT (id_usuario, id_variante)
             DO UPDATE SET cantidad = EXCLUDED.cantidad`,
            [idUsuario, item.idVariante, cantidadReal],
          );
        }
      }
    });
    return this.getCarrito(idUsuario);
  }

  // ── Sincronización de Favoritos en la Base de Datos ──
  async getFavoritos(idUsuario: number) {
    const rows = await this.dataSource.query(`
      SELECT 
        p.id_producto AS id,
        p.nombre_producto AS name,
        p.descripcion_producto AS desc,
        cat.nombre_categoria AS category,
        p.id_categoria AS "idCategoria",
        p.slug AS slug,
        COALESCE(img.url_imagen, '') AS image
      FROM favoritos f
      JOIN productos p ON f.id_producto = p.id_producto
      JOIN categorias cat ON p.id_categoria = cat.id_categoria
      LEFT JOIN imagenes_producto img ON p.id_producto = img.id_producto AND img.es_principal = true
      WHERE f.id_usuario = $1
    `, [idUsuario]);

    const prods: any[] = [];
    for (const r of rows) {
      const variants = await this.dataSource.query(`
        SELECT precio, stock FROM variantes_producto 
        WHERE id_producto = $1 AND estado = true
      `, [r.id]);
      const precios = variants.map((v: any) => Number(v.precio));
      const precioMin = precios.length > 0 ? Math.min(...precios) : 0;
      const precioMax = precios.length > 0 ? Math.max(...precios) : 0;
      
      prods.push({
        id: Number(r.id),
        name: r.name,
        price: precioMin,
        originalPrice: precioMax > precioMin ? precioMax : undefined,
        image: r.image,
        category: r.category,
        slug: r.slug,
        descripcion: r.desc ?? undefined,
      });
    }
    return prods;
  }

  async guardarFavoritos(idUsuario: number, ids: number[]) {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`DELETE FROM favoritos WHERE id_usuario = $1`, [idUsuario]);
      for (const idProd of ids) {
        if (!idProd || isNaN(idProd)) continue;
        await manager.query(
          `INSERT INTO favoritos (id_usuario, id_producto)
           VALUES ($1, $2)
           ON CONFLICT (id_usuario, id_producto) DO NOTHING`,
          [idUsuario, idProd],
        );
      }
    });
    return this.getFavoritos(idUsuario);
  }

  /** Vacía el carrito del usuario en la BD */
  async vaciarCarrito(idUsuario: number): Promise<void> {
    await this.dataSource.query(`DELETE FROM carrito WHERE id_usuario = $1`, [idUsuario]);
  }
}
