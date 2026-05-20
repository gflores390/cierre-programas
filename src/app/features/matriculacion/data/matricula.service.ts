import { Injectable, computed, signal } from '@angular/core';
import {
  EstadoMatricula,
  Matricula,
  MatriculaFiltro,
  Programa,
  SeleccionPrograma,
} from '../models/matricula.model';

const PROGRAMAS_MOCK: Programa[] = [
  { id: 1, nombre: 'Desarrollo de Software', turno: 'Mañana', version: 'v1', gestion: '2025', sede: 'central', modalidad: 'presencial', cupos: 30, inscritos: 22 },
  { id: 2, nombre: 'Desarrollo de Software', turno: 'Tarde',  version: 'v1', gestion: '2025', sede: 'central', modalidad: 'presencial', cupos: 30, inscritos: 28 },
  { id: 3, nombre: 'Contabilidad General',   turno: 'Mañana', version: 'v1', gestion: '2025', sede: 'central', modalidad: 'presencial', cupos: 25, inscritos: 10 },
  { id: 4, nombre: 'Administración de Empresas', turno: 'Noche', version: 'v1', gestion: '2025', sede: 'central', modalidad: 'semipresencial', cupos: 40, inscritos: 35 },
  { id: 5, nombre: 'Enfermería',             turno: 'Mañana', version: 'v2', gestion: '2025', sede: 'norte',   modalidad: 'presencial', cupos: 20, inscritos: 18 },
  { id: 6, nombre: 'Sistemas de Información',turno: 'Tarde',  version: 'v2', gestion: '2025', sede: 'norte',   modalidad: 'presencial', cupos: 30, inscritos: 15 },
  { id: 7, nombre: 'Turismo y Hotelería',    turno: 'Mañana', version: 'v1', gestion: '2025', sede: 'sur',     modalidad: 'presencial', cupos: 25, inscritos: 20 },
  { id: 8, nombre: 'Contabilidad General',   turno: 'Tarde',  version: 'v1', gestion: '2025', sede: 'sur',     modalidad: 'virtual',    cupos: 50, inscritos: 42 },
  { id: 9, nombre: 'Desarrollo de Software', turno: 'Mañana', version: 'v1', gestion: '2024', sede: 'central', modalidad: 'presencial', cupos: 30, inscritos: 30 },
  { id: 10, nombre: 'Administración de Empresas', turno: 'Tarde', version: 'v2', gestion: '2024', sede: 'norte', modalidad: 'virtual', cupos: 45, inscritos: 38 },
];

const DATOS_INICIALES: Matricula[] = [
  {
    id: 1, codigo: 'MAT-2025-001', ci: '6862870 LP', ru: 0, totalGrados: 5, tieneFoto: true,  tieneBoleta: true,
    estudiante: { nombres: 'María Fernanda', apellidos: 'Quispe Mamani', avatar: '/images/user/user-17.jpg' },
    rude: '20251001234', curso: '6to de Secundaria - A',
    tutor: { nombre: 'Rosa Mamani', parentesco: 'Madre' },
    contacto: { telefono: '70123456', email: 'rosa.mamani@correo.com' },
    estado: 'activo',
  },
  {
    id: 2, codigo: 'MAT-2025-002', ci: '7541230 CB', ru: 1, totalGrados: 4, tieneFoto: true,  tieneBoleta: false,
    estudiante: { nombres: 'Carlos Eduardo', apellidos: 'Choque Vargas', avatar: '/images/user/user-18.jpg' },
    rude: '20251001235', curso: '5to de Secundaria - B',
    tutor: { nombre: 'Luis Choque', parentesco: 'Padre' },
    contacto: { telefono: '71234567', email: 'luis.choque@correo.com' },
    estado: 'activo',
  },
  {
    id: 3, codigo: 'MAT-2025-003', ci: '5123987 SC', ru: 0, totalGrados: 3, tieneFoto: false, tieneBoleta: false,
    estudiante: { nombres: 'Ana Lucía', apellidos: 'Condori Flores', avatar: '/images/user/user-19.jpg' },
    rude: '20251001236', curso: '4to de Secundaria - A',
    tutor: { nombre: 'Patricia Flores', parentesco: 'Madre' },
    contacto: { telefono: '72345678' },
    estado: 'suspendido',
  },
  {
    id: 4, codigo: 'MAT-2025-004', ci: '4987654 OR', ru: 2, totalGrados: 2, tieneFoto: false, tieneBoleta: true,
    estudiante: { nombres: 'Jorge Andrés', apellidos: 'Apaza Lima', avatar: '/images/user/user-20.jpg' },
    rude: '20251001237', curso: '3ro de Secundaria - C',
    tutor: { nombre: 'Marina Lima', parentesco: 'Madre' },
    contacto: { telefono: '73456789', email: 'marina.lima@correo.com' },
    estado: 'retirado',
  },
  {
    id: 5, codigo: 'MAT-2025-005', ci: '8234561 PT', ru: 0, totalGrados: 6, tieneFoto: true,  tieneBoleta: true,
    estudiante: { nombres: 'Valeria', apellidos: 'Rojas Cárdenas', avatar: '/images/user/user-21.jpg' },
    rude: '20251001238', curso: '6to de Secundaria - B',
    tutor: { nombre: 'Hugo Rojas', parentesco: 'Padre' },
    contacto: { telefono: '74567890', email: 'hugo.rojas@correo.com' },
    estado: 'egresado',
  },
  {
    id: 6, codigo: 'MAT-2025-006', ci: '3658741 BN', ru: 1, totalGrados: 1, tieneFoto: false, tieneBoleta: false,
    estudiante: { nombres: 'Diego Alejandro', apellidos: 'Mendoza Paredes', avatar: '/images/user/user-22.jpg' },
    rude: '20251001239', curso: '2do de Secundaria - A',
    tutor: { nombre: 'Carla Paredes', parentesco: 'Madre' },
    contacto: { telefono: '75678901' },
    estado: 'activo',
  },
  {
    id: 7, codigo: 'MAT-2025-007', ci: '9012345 TJ', ru: 0, totalGrados: 0, tieneFoto: true,  tieneBoleta: false,
    estudiante: { nombres: 'Camila', apellidos: 'Vega Soliz', avatar: '/images/user/user-23.jpg' },
    rude: '20251001240', curso: '1ro de Secundaria - B',
    tutor: { nombre: 'Pedro Vega', parentesco: 'Padre' },
    contacto: { telefono: '76789012', email: 'pedro.vega@correo.com' },
    estado: 'activo',
  },
  {
    id: 8, codigo: 'MAT-2025-008', ci: '6345678 QR', ru: 3, totalGrados: 4, tieneFoto: false, tieneBoleta: true,
    estudiante: { nombres: 'Sebastián', apellidos: 'Torrico Aliaga', avatar: '/images/user/user-24.jpg' },
    rude: '20251001241', curso: '5to de Secundaria - A',
    tutor: { nombre: 'Lucía Aliaga', parentesco: 'Madre' },
    contacto: { telefono: '77890123' },
    estado: 'suspendido',
  },
  {
    id: 9, codigo: 'MAT-2025-009', ci: '7890123 CH', ru: 0, totalGrados: 3, tieneFoto: true,  tieneBoleta: true,
    estudiante: { nombres: 'Isabela', apellidos: 'Ramos Gutiérrez', avatar: '/images/user/user-25.jpg' },
    rude: '20251001242', curso: '4to de Secundaria - C',
    tutor: { nombre: 'Ana Gutiérrez', parentesco: 'Madre' },
    contacto: { telefono: '78901234', email: 'ana.gutierrez@correo.com' },
    estado: 'activo',
  },
  {
    id: 10, codigo: 'MAT-2025-010', ci: '5432109 LP', ru: 1, totalGrados: 2, tieneFoto: false, tieneBoleta: false,
    estudiante: { nombres: 'Mateo', apellidos: 'Salinas Rivera', avatar: '/images/user/user-26.jpg' },
    rude: '20251001243', curso: '3ro de Secundaria - A',
    tutor: { nombre: 'Raúl Salinas', parentesco: 'Padre' },
    contacto: { telefono: '79012345', email: 'raul.salinas@correo.com' },
    estado: 'activo',
  },
  {
    id: 11, codigo: 'MAT-2025-011', ci: '4123456 CB', ru: 0, totalGrados: 1, tieneFoto: true,  tieneBoleta: false,
    estudiante: { nombres: 'Lucía Andrea', apellidos: 'Calle Nina', avatar: '/images/user/user-27.jpg' },
    rude: '20251001244', curso: '2do de Secundaria - B',
    tutor: { nombre: 'Rosario Nina', parentesco: 'Madre' },
    contacto: { telefono: '70112233' },
    estado: 'retirado',
  },
  {
    id: 12, codigo: 'MAT-2025-012', ci: '8901234 SC', ru: 2, totalGrados: 6, tieneFoto: true, tieneBoleta: true,
    estudiante: { nombres: 'Tomás', apellidos: 'Loayza Pérez', avatar: '/images/user/user-28.jpg' },
    rude: '20251001245', curso: '6to de Secundaria - A',
    tutor: { nombre: 'Mario Loayza', parentesco: 'Padre' },
    contacto: { telefono: '71223344', email: 'mario.loayza@correo.com' },
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
