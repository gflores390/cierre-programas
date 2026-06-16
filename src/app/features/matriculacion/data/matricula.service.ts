import { Injectable, computed, signal } from '@angular/core';
import {
  Deposito,
  EstadoMatricula,
  Matricula,
  MatriculaFiltro,
  Programa,
  SeleccionPrograma,
  TipoPrograma,
  ConteoPorTipoPrograma,
} from '../models/matricula.model';

const DEPOSITOS_MOCK: Record<number, Deposito[]> = {
  1: [
    { id: 1, fecha: '2026-03-10', nroDeposito: '5212331930', monto: 960,   tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'comprobado' },
    { id: 2, fecha: '2026-01-29', nroDeposito: '5101149421', monto: 1000,  tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'comprobado' },
    { id: 3, fecha: '2026-01-23', nroDeposito: '5067573585', monto: 200,   tipoPago: 'Pago por Matriculación', metodoPago: 'Transferencia', estado: 'comprobado' },
  ],
  2: [
    { id: 4, fecha: '2026-02-15', nroDeposito: '5198234761', monto: 200,   tipoPago: 'Pago por Matriculación', metodoPago: 'Depósito',      estado: 'comprobado' },
    { id: 5, fecha: '2026-03-01', nroDeposito: '5220987345', monto: 800,   tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'pendiente'  },
  ],
  4: [
    { id: 6, fecha: '2026-01-10', nroDeposito: '5045321098', monto: 200,   tipoPago: 'Pago por Matriculación', metodoPago: 'Efectivo',      estado: 'comprobado' },
  ],
  5: [
    { id: 7, fecha: '2025-12-05', nroDeposito: '4987654321', monto: 200,   tipoPago: 'Pago por Matriculación', metodoPago: 'Transferencia', estado: 'comprobado' },
    { id: 8, fecha: '2026-01-20', nroDeposito: '5080111222', monto: 960,   tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'comprobado' },
    { id: 9, fecha: '2026-02-20', nroDeposito: '5155443322', monto: 960,   tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'comprobado' },
    { id: 10, fecha: '2026-03-20', nroDeposito: '5231776655', monto: 960,  tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'pendiente'  },
  ],
  9: [
    { id: 11, fecha: '2026-01-18', nroDeposito: '5062334455', monto: 200,  tipoPago: 'Pago por Matriculación', metodoPago: 'Depósito',      estado: 'comprobado' },
    { id: 12, fecha: '2026-02-10', nroDeposito: '5133221100', monto: 750,  tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'rechazado'  },
  ],
  12: [
    { id: 13, fecha: '2025-11-28', nroDeposito: '4901234567', monto: 200,  tipoPago: 'Pago por Matriculación', metodoPago: 'Efectivo',      estado: 'comprobado' },
    { id: 14, fecha: '2026-01-05', nroDeposito: '5010223344', monto: 960,  tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'comprobado' },
    { id: 15, fecha: '2026-02-05', nroDeposito: '5088112233', monto: 960,  tipoPago: 'Pago por Colegiatura',   metodoPago: 'Transferencia', estado: 'comprobado' },
  ],
};

const PROGRAMAS_MOCK: Programa[] = [
  { id: 1,  tipoPrograma: 'diplomado',     nombre: 'Desarrollo de Software',     turno: 'Mañana', version: 'v1', gestion: '2025', sede: 'central', modalidad: 'presencial',    cupos: 30, inscritos: 22 },
  { id: 2,  tipoPrograma: 'maestria',      nombre: 'Desarrollo de Software',     turno: 'Tarde',  version: 'v1', gestion: '2025', sede: 'central', modalidad: 'presencial',    cupos: 30, inscritos: 28 },
  { id: 3,  tipoPrograma: 'especialidad',  nombre: 'Contabilidad General',       turno: 'Mañana', version: 'v1', gestion: '2025', sede: 'central', modalidad: 'presencial',    cupos: 25, inscritos: 10 },
  { id: 4,  tipoPrograma: 'doctorado',     nombre: 'Administración de Empresas', turno: 'Noche',  version: 'v1', gestion: '2025', sede: 'central', modalidad: 'semipresencial', cupos: 40, inscritos: 35 },
  { id: 5,  tipoPrograma: 'maestria',      nombre: 'Enfermería',                 turno: 'Mañana', version: 'v2', gestion: '2025', sede: 'norte',   modalidad: 'presencial',    cupos: 20, inscritos: 18 },
  { id: 6,  tipoPrograma: 'diplomado',     nombre: 'Sistemas de Información',    turno: 'Tarde',  version: 'v2', gestion: '2025', sede: 'norte',   modalidad: 'presencial',    cupos: 30, inscritos: 15 },
  { id: 7,  tipoPrograma: 'postdoctorado', nombre: 'Turismo y Hotelería',        turno: 'Mañana', version: 'v1', gestion: '2025', sede: 'sur',     modalidad: 'presencial',    cupos: 25, inscritos: 20 },
  { id: 8,  tipoPrograma: 'especialidad',  nombre: 'Contabilidad General',       turno: 'Tarde',  version: 'v1', gestion: '2025', sede: 'sur',     modalidad: 'virtual',       cupos: 50, inscritos: 42 },
  { id: 9,  tipoPrograma: 'maestria',      nombre: 'Desarrollo de Software',     turno: 'Mañana', version: 'v1', gestion: '2024', sede: 'central', modalidad: 'presencial',    cupos: 30, inscritos: 30 },
  { id: 10, tipoPrograma: 'doctorado',     nombre: 'Administración de Empresas', turno: 'Tarde',  version: 'v2', gestion: '2024', sede: 'norte',   modalidad: 'virtual',       cupos: 45, inscritos: 38 },
];

const DATOS_INICIALES: Matricula[] = [
  {
    id: 1, codigo: 'MAT-2025-001', ci: '6862870 LP', ru: 0, totalGrados: 5, tieneFoto: true, tieneBoleta: true,
    estudiante: { nombres: 'María Fernanda', apellidos: 'Quispe Mamani', apellidoPaterno: 'Quispe', apellidoMaterno: 'Mamani', fechaNacimiento: '15-08-2003', genero: 'femenino', nacionalidad: 'Boliviana', avatar: '/images/user/user-17.jpg' },
    rude: '20251001234', curso: '6to de Secundaria - A',
    tutor: { nombre: 'Rosa Mamani', parentesco: 'Madre' },
    contacto: { telefono: '70123456', celularReferencia: '60123456', email: 'rosa.mamani@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Calle Baptista 123, La Paz',
    depositos: DEPOSITOS_MOCK[1],
    estado: 'activo',
  },
  {
    id: 2, codigo: 'MAT-2025-002', ci: '7541230 CB', ru: 1, totalGrados: 4, tieneFoto: true, tieneBoleta: false,
    estudiante: { nombres: 'Carlos Eduardo', apellidos: 'Choque Vargas', apellidoPaterno: 'Choque', apellidoMaterno: 'Vargas', fechaNacimiento: '22-03-2004', genero: 'masculino', nacionalidad: 'Boliviano', avatar: '/images/user/user-18.jpg' },
    rude: '20251001235', curso: '5to de Secundaria - B',
    tutor: { nombre: 'Luis Choque', parentesco: 'Padre' },
    contacto: { telefono: '71234567', email: 'luis.choque@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Av. América 456, Cochabamba',
    depositos: DEPOSITOS_MOCK[2],
    estado: 'activo',
  },
  {
    id: 3, codigo: 'MAT-2025-003', ci: '5123987 SC', ru: 0, totalGrados: 3, tieneFoto: false, tieneBoleta: false,
    estudiante: { nombres: 'Ana Lucía', apellidos: 'Condori Flores', apellidoPaterno: 'Condori', apellidoMaterno: 'Flores', fechaNacimiento: '07-11-2004', genero: 'femenino', nacionalidad: 'Boliviana', avatar: '/images/user/user-19.jpg' },
    rude: '20251001236', curso: '4to de Secundaria - A',
    tutor: { nombre: 'Patricia Flores', parentesco: 'Madre' },
    contacto: { telefono: '72345678', celularReferencia: '67890123' },
    estadoCivil: 'soltero', domicilio: 'Barrio Hamacas, Santa Cruz',
    estado: 'suspendido',
  },
  {
    id: 4, codigo: 'MAT-2025-004', ci: '4987654 OR', ru: 2, totalGrados: 2, tieneFoto: false, tieneBoleta: true,
    estudiante: { nombres: 'Jorge Andrés', apellidos: 'Apaza Lima', apellidoPaterno: 'Apaza', apellidoMaterno: 'Lima', fechaNacimiento: '30-05-2005', genero: 'masculino', nacionalidad: 'Boliviano', avatar: '/images/user/user-20.jpg' },
    rude: '20251001237', curso: '3ro de Secundaria - C',
    tutor: { nombre: 'Marina Lima', parentesco: 'Madre' },
    contacto: { telefono: '73456789', celularReferencia: '62345678', email: 'marina.lima@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Villa Bolívar, Oruro',
    depositos: DEPOSITOS_MOCK[4],
    estado: 'retirado',
  },
  {
    id: 5, codigo: 'MAT-2025-005', ci: '8234561 PT', ru: 0, totalGrados: 6, tieneFoto: true, tieneBoleta: true,
    estudiante: { nombres: 'Valeria', apellidos: 'Rojas Cárdenas', apellidoPaterno: 'Rojas', apellidoMaterno: 'Cárdenas', fechaNacimiento: '19-01-2003', genero: 'femenino', nacionalidad: 'Boliviana', avatar: '/images/user/user-21.jpg' },
    rude: '20251001238', curso: '6to de Secundaria - B',
    tutor: { nombre: 'Hugo Rojas', parentesco: 'Padre' },
    contacto: { telefono: '74567890', email: 'hugo.rojas@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Calle Sucre 89, Potosí',
    depositos: DEPOSITOS_MOCK[5],
    estado: 'egresado',
  },
  {
    id: 6, codigo: 'MAT-2025-006', ci: '3658741 BN', ru: 1, totalGrados: 1, tieneFoto: false, tieneBoleta: false,
    estudiante: { nombres: 'Diego Alejandro', apellidos: 'Mendoza Paredes', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Paredes', fechaNacimiento: '14-09-2006', genero: 'masculino', nacionalidad: 'Boliviano', avatar: '/images/user/user-22.jpg' },
    rude: '20251001239', curso: '2do de Secundaria - A',
    tutor: { nombre: 'Carla Paredes', parentesco: 'Madre' },
    contacto: { telefono: '75678901', celularReferencia: '64567890' },
    estadoCivil: 'soltero', domicilio: 'Barrio Central, Trinidad',
    estado: 'activo',
  },
  {
    id: 7, codigo: 'MAT-2025-007', ci: '9012345 TJ', ru: 0, totalGrados: 0, tieneFoto: true, tieneBoleta: false,
    estudiante: { nombres: 'Camila', apellidos: 'Vega Soliz', apellidoPaterno: 'Vega', apellidoMaterno: 'Soliz', fechaNacimiento: '03-06-2006', genero: 'femenino', nacionalidad: 'Boliviana', avatar: '/images/user/user-23.jpg' },
    rude: '20251001240', curso: '1ro de Secundaria - B',
    tutor: { nombre: 'Pedro Vega', parentesco: 'Padre' },
    contacto: { telefono: '76789012', celularReferencia: '65678901', email: 'pedro.vega@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Av. Circunvalación 34, Tarija',
    estado: 'activo',
  },
  {
    id: 8, codigo: 'MAT-2025-008', ci: '6345678 CB', ru: 3, totalGrados: 4, tieneFoto: false, tieneBoleta: true,
    estudiante: { nombres: 'Sebastián', apellidos: 'Torrico Aliaga', apellidoPaterno: 'Torrico', apellidoMaterno: 'Aliaga', fechaNacimiento: '25-02-2005', genero: 'masculino', nacionalidad: 'Boliviano', avatar: '/images/user/user-24.jpg' },
    rude: '20251001241', curso: '5to de Secundaria - A',
    tutor: { nombre: 'Lucía Aliaga', parentesco: 'Madre' },
    contacto: { telefono: '77890123', celularReferencia: '66789012' },
    estadoCivil: 'soltero', domicilio: 'Zona Norte, Cochabamba',
    estado: 'suspendido',
  },
  {
    id: 9, codigo: 'MAT-2025-009', ci: '7890123 CH', ru: 0, totalGrados: 3, tieneFoto: true, tieneBoleta: true,
    estudiante: { nombres: 'Isabela', apellidos: 'Ramos Gutiérrez', apellidoPaterno: 'Ramos', apellidoMaterno: 'Gutiérrez', fechaNacimiento: '11-12-2004', genero: 'femenino', nacionalidad: 'Boliviana', avatar: '/images/user/user-25.jpg' },
    rude: '20251001242', curso: '4to de Secundaria - C',
    tutor: { nombre: 'Ana Gutiérrez', parentesco: 'Madre' },
    contacto: { telefono: '78901234', celularReferencia: '67890123', email: 'ana.gutierrez@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Calle Arenales 12, Sucre',
    depositos: DEPOSITOS_MOCK[9],
    estado: 'activo',
  },
  {
    id: 10, codigo: 'MAT-2025-010', ci: '5432109 LP', ru: 1, totalGrados: 2, tieneFoto: false, tieneBoleta: false,
    estudiante: { nombres: 'Mateo', apellidos: 'Salinas Rivera', apellidoPaterno: 'Salinas', apellidoMaterno: 'Rivera', fechaNacimiento: '08-07-2005', genero: 'masculino', nacionalidad: 'Boliviano', avatar: '/images/user/user-26.jpg' },
    rude: '20251001243', curso: '3ro de Secundaria - A',
    tutor: { nombre: 'Raúl Salinas', parentesco: 'Padre' },
    contacto: { telefono: '79012345', celularReferencia: '68901234', email: 'raul.salinas@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Zona Sur, El Alto',
    estado: 'activo',
  },
  {
    id: 11, codigo: 'MAT-2025-011', ci: '4123456 CB', ru: 0, totalGrados: 1, tieneFoto: true, tieneBoleta: false,
    estudiante: { nombres: 'Lucía Andrea', apellidos: 'Calle Nina', apellidoPaterno: 'Calle', apellidoMaterno: 'Nina', fechaNacimiento: '17-04-2006', genero: 'femenino', nacionalidad: 'Boliviana', avatar: '/images/user/user-27.jpg' },
    rude: '20251001244', curso: '2do de Secundaria - B',
    tutor: { nombre: 'Rosario Nina', parentesco: 'Madre' },
    contacto: { telefono: '70112233', celularReferencia: '61122334' },
    estadoCivil: 'soltero', domicilio: 'Av. Blanco Galindo km 4, Cochabamba',
    estado: 'retirado',
  },
  {
    id: 12, codigo: 'MAT-2025-012', ci: '8901234 SC', ru: 2, totalGrados: 6, tieneFoto: true, tieneBoleta: true,
    estudiante: { nombres: 'Tomás', apellidos: 'Loayza Pérez', apellidoPaterno: 'Loayza', apellidoMaterno: 'Pérez', fechaNacimiento: '29-10-2003', genero: 'masculino', nacionalidad: 'Boliviano', avatar: '/images/user/user-28.jpg' },
    rude: '20251001245', curso: '6to de Secundaria - A',
    tutor: { nombre: 'Mario Loayza', parentesco: 'Padre' },
    contacto: { telefono: '71223344', celularReferencia: '62233445', email: 'mario.loayza@correo.com' },
    estadoCivil: 'soltero', domicilio: 'Barrio Las Palmas, Santa Cruz',
    depositos: DEPOSITOS_MOCK[12],
    estado: 'egresado',
  },
];

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private readonly _matriculas = signal<Matricula[]>(DATOS_INICIALES);
  private readonly _filtro = signal<MatriculaFiltro>({
    busqueda: '',
    estado: 'todos',
    gestion: '2025',
    periodo: 'anual',
  });
  private readonly _pagina = signal(1);
  private readonly _porPagina = signal(10);
  private readonly _seleccionPrograma = signal<SeleccionPrograma>({
    version: 'todas',
    gestion: '2025',
    sede: 'central',
    modalidad: 'todas',
    programa: '',
  });

  readonly seleccionPrograma = this._seleccionPrograma.asReadonly();
  readonly filtro = this._filtro.asReadonly();

  readonly programasFiltrados = computed(() => {
    const { version, gestion, sede, modalidad } = this._seleccionPrograma();
    return PROGRAMAS_MOCK.filter(p => {
      if (version !== 'todas' && p.version !== version) return false;
      if (p.gestion !== gestion) return false;
      if (p.sede !== sede) return false;
      if (modalidad !== 'todas' && p.modalidad !== modalidad) return false;
      return true;
    });
  });
  readonly pagina = this._pagina.asReadonly();
  readonly porPagina = this._porPagina.asReadonly();

  readonly matriculasFiltradas = computed(() => {
    const { busqueda, estado } = this._filtro();
    const termino = busqueda.trim().toLowerCase();

    return this._matriculas().filter((matricula) => {
      const coincideEstado = estado === 'todos' || matricula.estado === estado;
      if (!coincideEstado) return false;
      if (!termino) return true;

      const nombreCompleto =
        `${matricula.estudiante.nombres} ${matricula.estudiante.apellidos}`.toLowerCase();
      return (
        nombreCompleto.includes(termino) ||
        matricula.rude.toLowerCase().includes(termino) ||
        matricula.curso.toLowerCase().includes(termino) ||
        matricula.tutor.nombre.toLowerCase().includes(termino)
      );
    });
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.matriculasFiltradas().length / this._porPagina())),
  );

  readonly paginaActual = computed(() => {
    const inicio = (this._pagina() - 1) * this._porPagina();
    return this.matriculasFiltradas().slice(inicio, inicio + this._porPagina());
  });

  readonly conteoPorEstado = computed(() => {
    const matriculas = this._matriculas();
    const conteo: Record<EstadoMatricula | 'todos', number> = {
      todos: matriculas.length,
      activo: 0,
      suspendido: 0,
      retirado: 0,
      egresado: 0,
    };
    for (const matricula of matriculas) conteo[matricula.estado]++;
    return conteo;
  });
 readonly conteoPorTipoPrograma = computed((): ConteoPorTipoPrograma => {
  return {
    todos:         PROGRAMAS_MOCK.length,
    diplomado:     PROGRAMAS_MOCK.filter(p => p.tipoPrograma === 'diplomado').length,
    especialidad:  PROGRAMAS_MOCK.filter(p => p.tipoPrograma === 'especialidad').length,
    maestria:      PROGRAMAS_MOCK.filter(p => p.tipoPrograma === 'maestria').length,
    doctorado:     PROGRAMAS_MOCK.filter(p => p.tipoPrograma === 'doctorado').length,
    postdoctorado: PROGRAMAS_MOCK.filter(p => p.tipoPrograma === 'postdoctorado').length,
  };
});

  actualizarBusqueda(termino: string): void {
    this._filtro.update((actual) => ({ ...actual, busqueda: termino }));
    this._pagina.set(1);
  }

  actualizarEstado(estado: EstadoMatricula | 'todos'): void {
    this._filtro.update((actual) => ({ ...actual, estado }));
    this._pagina.set(1);
  }

  actualizarGestion(gestion: string): void {
    this._filtro.update((actual) => ({ ...actual, gestion }));
  }

  actualizarPeriodo(periodo: string): void {
    this._filtro.update((actual) => ({ ...actual, periodo }));
  }

  irAPagina(pagina: number): void {
    const total = this.totalPaginas();
    if (pagina < 1 || pagina > total) return;
    this._pagina.set(pagina);
  }

  actualizarSeleccionPrograma(parcial: Partial<SeleccionPrograma>): void {
    this._seleccionPrograma.update((actual) => ({ ...actual, ...parcial }));
  }
}
