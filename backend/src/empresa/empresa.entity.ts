import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  // ==========================================
  // SECCIÓN 1: Datos generales de la empresa
  // ==========================================

  @Column()
  razonSocial: string;

  @Column()
  correo: string; // Correo de contacto de la empresa

  @Column({ nullable: true })
  rfc: string; // NUEVO: RFC de la empresa

  @Column({ nullable: true })
  sectorScian: string; // NUEVO: Código SCIAN (input libre)

  @Column({ nullable: true })
  representante: string;

  @Column({ nullable: true })
  paginaWeb: string;

  @Column({ nullable: true })
  estado: string; // NUEVO: Estado de la república (dropdown)

  @Column({ nullable: true })
  empleados: string; // Cambiado a string (rango: "0-5 empleados")

  @Column({ nullable: true })
  antiguedad: string;

  @Column({ nullable: true })
  volumenVentas: string;

  @Column({ nullable: true })
  ambito: string; // Financiero, Medio ambiental, Social

  // ==========================================
  // SECCIÓN 2: Misión y visión
  // ==========================================

  @Column({ type: 'text', nullable: true })
  mision: string;

  @Column({ type: 'text', nullable: true })
  vision: string;

  // ==========================================
  // SECCIÓN 3: Productos y servicios
  // ==========================================

  @Column({ type: 'jsonb', nullable: true })
  productos: string[]; // NUEVO: Array de productos

  @Column({ type: 'jsonb', nullable: true })
  servicios: string[]; // NUEVO: Array de servicios

  // ==========================================
  // SECCIÓN 4: ODS (Objetivos de Desarrollo Sostenible)
  // ==========================================

  @Column({ type: 'jsonb', nullable: true })
  ods: number[]; // NUEVO: Array de números [1, 5, 13] (los ODS marcados)

  @Column({ type: 'jsonb', nullable: true })
  actividadesOds: string[]; // NUEVO: Array de actividades

  // ==========================================
  // SECCIÓN 5: Sucursales y socios
  // ==========================================

  @Column({ default: false })
  tieneSucursales: boolean; // NUEVO: Sí/No

  @Column({ default: false })
  tieneSocios: boolean; // NUEVO: Sí/No

  @Column({ type: 'jsonb', nullable: true })
  sucursales: string[]; // NUEVO: Array de estados donde tiene sucursales

  @Column({ type: 'jsonb', nullable: true })
  socios: string[]; // NUEVO: Array de socios comerciales

  // ==========================================
  // SECCIÓN 6: Operaciones internacionales
  // ==========================================

  @Column({ type: 'jsonb', nullable: true })
  tiposOperaciones: string[]; // NUEVO: ["Importación", "Exportación"] o ["Ninguna"]

  @Column({ type: 'jsonb', nullable: true })
  paisesImportacion: string[]; // NUEVO: Array de países

  @Column({ type: 'jsonb', nullable: true })
  paisesExportacion: string[]; // NUEVO: Array de países

  @Column({ type: 'jsonb', nullable: true })
  transporteExtranjero: string[]; // NUEVO: ["Aéreo", "Marítimo"]

  @Column({ type: 'jsonb', nullable: true })
  transporteNacional: string[]; // NUEVO: ["Carretera", "Ferroviario"]

  // ==========================================
  // SECCIÓN 7: Logo
  // ==========================================

  @Column({ nullable: true })
  logo: string; // Ruta del logo subido

  // ==========================================
  // CAMPOS DE SISTEMA
  // ==========================================

  @Column({ nullable: true })
  userId?: number; // Vincula con el usuario dueño

  @Column({ default: 'basico' })
  paquete: string; // basico, pro, premium, platino

  @CreateDateColumn()
  createdAt: Date;

  // ==========================================
  // CAMPOS OBSOLETOS (mantener por compatibilidad)
  // ==========================================
  // Los siguientes campos existían antes pero ya NO se usan.
  // Se mantienen aquí para que Supabase no borre las columnas
  // y no perdamos datos de registros antiguos.

  @Column({ nullable: true })
  ubicacion: string; // Obsoleto (reemplazado por 'estado')

  @Column({ default: false })
  importaciones: boolean; // Obsoleto (reemplazado por 'tiposOperaciones')

  @Column({ default: false })
  exportaciones: boolean; // Obsoleto (reemplazado por 'tiposOperaciones')

  @Column({ nullable: true })
  objetivos: string; // Obsoleto (reemplazado por 'actividadesOds')

  @Column({ nullable: true, length: 10 })
  scianCodigo: string; // Obsoleto (reemplazado por 'sectorScian')

  @Column({ nullable: true, type: 'text' })
  scianDescripcion: string; // Obsoleto
}