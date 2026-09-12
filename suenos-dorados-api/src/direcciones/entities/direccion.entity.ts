import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('direcciones')
export class Direccion {
  @PrimaryGeneratedColumn({ name: 'id_direccion' })
  idDireccion!: number;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario!: number;

  // ── Datos del destinatario ──────────────────────────────────────────────
  @Column({ name: 'nombre_destinatario', type: 'varchar', length: 160, nullable: true })
  nombreDestinatario!: string | null;

  @Column({ name: 'telefono_contacto', type: 'varchar', length: 25, nullable: true })
  telefonoContacto!: string | null;

  @Column({ name: 'documento_identidad', type: 'varchar', length: 30, nullable: true })
  documentoIdentidad!: string | null;

  // ── Ubicación geográfica ────────────────────────────────────────────────
  @Column({ name: 'pais', type: 'varchar', length: 80, default: 'Colombia', nullable: true })
  pais!: string;

  @Column({ name: 'descripcion_departamento', type: 'varchar', length: 100 })
  descripcionDepartamento!: string;

  @Column({ name: 'descripcion_municipio', type: 'varchar', length: 100 })
  descripcionMunicipio!: string;

  // ── Dirección física ────────────────────────────────────────────────────
  @Column({ name: 'descripcion_direccion', type: 'varchar', length: 200 })
  descripcionDireccion!: string;

  @Column({ name: 'complemento', type: 'varchar', length: 120, nullable: true })
  complemento!: string | null;

  @Column({ name: 'descripcion_barrio', type: 'varchar', length: 100, nullable: true })
  descripcionBarrio!: string | null;

  @Column({ name: 'codigo_postal', type: 'varchar', length: 15, nullable: true })
  codigoPostal!: string | null;

  @Column({ name: 'indicaciones', type: 'text', nullable: true })
  indicaciones!: string | null;

  // ── Preferencias ────────────────────────────────────────────────────────
  @Column({ name: 'etiqueta', type: 'varchar', length: 30, default: 'Casa', nullable: true })
  etiqueta!: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;
}
