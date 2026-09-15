import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Envio } from './entities/envio.entity';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';

@Injectable()
export class EnvioService {
  constructor(
    @InjectRepository(Envio)
    private readonly repo: Repository<Envio>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Envio[]> {
    return this.repo.find({ order: { idEnvio: 'DESC' } });
  }

  async findByPedido(idPedido: number): Promise<Envio> {
    const envio = await this.repo.findOne({ where: { idPedido } });
    if (!envio) throw new NotFoundException(`No hay envío registrado para el pedido ${idPedido}`);
    return envio;
  }

  async findOne(id: number): Promise<Envio> {
    const envio = await this.repo.findOne({ where: { idEnvio: id } });
    if (!envio) throw new NotFoundException(`Envío ${id} no encontrado`);
    return envio;
  }

  async crear(dto: CreateEnvioDto): Promise<Envio> {
    // Verificar que no exista ya un envío para ese pedido
    const existe = await this.repo.findOne({ where: { idPedido: dto.idPedido } });
    if (existe) throw new ConflictException(`Ya existe un envío para el pedido ${dto.idPedido}`);

    const envio = this.repo.create({
      idPedido: dto.idPedido,
      idEstadoEnvio: dto.idEstadoEnvio,
      numeroGuia: dto.numeroGuia ?? null,
      transportadora: dto.transportadora ?? null,
      fechaEnvio: dto.fechaEnvio ? new Date(dto.fechaEnvio) : null,
      fechaEntregaEstimada: dto.fechaEntregaEstimada ? new Date(dto.fechaEntregaEstimada) : null,
      fechaEntregaReal: dto.fechaEntregaReal ? new Date(dto.fechaEntregaReal) : null,
    });

    const guardado = await this.repo.save(envio);

    // Actualizar estado del pedido a "Despachado" (id 4) si se registra guía
    if (dto.numeroGuia) {
      await this.dataSource.query(
        `UPDATE pedidos SET id_estado_pedido = 4 WHERE id_pedido = $1`,
        [dto.idPedido],
      );
    }

    return guardado;
  }

  async actualizar(id: number, dto: UpdateEnvioDto): Promise<Envio> {
    const envio = await this.findOne(id);
    if (dto.idEstadoEnvio !== undefined) envio.idEstadoEnvio = dto.idEstadoEnvio;
    if (dto.numeroGuia !== undefined) envio.numeroGuia = dto.numeroGuia ?? null;
    if (dto.transportadora !== undefined) envio.transportadora = dto.transportadora ?? null;
    if (dto.fechaEnvio !== undefined) envio.fechaEnvio = dto.fechaEnvio ? new Date(dto.fechaEnvio) : null;
    if (dto.fechaEntregaEstimada !== undefined) envio.fechaEntregaEstimada = dto.fechaEntregaEstimada ? new Date(dto.fechaEntregaEstimada) : null;
    if (dto.fechaEntregaReal !== undefined) {
      envio.fechaEntregaReal = dto.fechaEntregaReal ? new Date(dto.fechaEntregaReal) : null;
      // Si se registra entrega real, actualizar pedido a "Entregado" (id 5)
      if (dto.fechaEntregaReal) {
        await this.dataSource.query(
          `UPDATE pedidos SET id_estado_pedido = 5 WHERE id_pedido = $1`,
          [envio.idPedido],
        );
      }
    }
    return this.repo.save(envio);
  }

  /** Detalle completo del envío con info del pedido y estados */
  async detalleCompleto(idPedido: number) {
    const rows = await this.dataSource.query(`
      SELECT
        e.id_envio,
        e.id_pedido,
        e.numero_guia,
        e.transportadora,
        e.fecha_envio,
        e.fecha_entrega_estimada,
        e.fecha_entrega_real,
        ee.descripcion_estado  AS estado_envio,
        ep.descripcion_estado  AS estado_pedido,
        u.nombre_usuario,
        u.apellido_usuario,
        u.correo_electronico,
        u.telefono,
        d.descripcion_direccion,
        d.descripcion_municipio,
        d.descripcion_departamento,
        COALESCE(d.pais,'Colombia') AS pais
      FROM envio e
      LEFT JOIN estado_envio  ee ON ee.id_estado_envio  = e.id_estado_envio
      LEFT JOIN pedidos        p  ON p.id_pedido         = e.id_pedido
      LEFT JOIN estado_pedido ep  ON ep.id_estado_pedido = p.id_estado_pedido
      LEFT JOIN usuarios       u  ON u.id_usuario        = p.id_usuario
      LEFT JOIN direcciones    d  ON d.id_direccion      = p.id_direccion
      WHERE e.id_pedido = $1
    `, [idPedido]);

    if (!rows.length) throw new NotFoundException(`No hay envío para el pedido ${idPedido}`);
    return rows[0];
  }
}
