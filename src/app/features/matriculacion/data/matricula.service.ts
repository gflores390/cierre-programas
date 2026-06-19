import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  Deposito,
  EstadoMatricula,
  Matricula,
  MatriculaFiltro,
  Programa,
  ProgramaApi,
  ProgramasApiResponse,
  SeleccionPrograma,
  TipoPrograma,
  ConteoPorTipoPrograma,
  ParticipanteApi,
} from '../models/matricula.model';
import { ParticipantesService } from './participante.service';
const DEPOSITOS_MOCK: Record<number, Deposito[]> = {

};

const DATOS_INICIALES: Matricula[] = [

];

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private readonly http = inject(HttpClient);
  private readonly participantesService = inject(ParticipantesService);

  private readonly _matriculas = signal<Matricula[]>(DATOS_INICIALES);

  private readonly _programasApi = signal<Programa[]>([]);
  private readonly _cargandoProgramas = signal(false);
  private readonly _errorProgramas = signal<string | null>(null);

  readonly cargandoProgramas = this._cargandoProgramas.asReadonly();
  readonly errorProgramas = this._errorProgramas.asReadonly();

  private readonly _cargandoParticipantes = signal(false);
  private readonly _errorParticipantes = signal<string | null>(null);

  readonly cargandoParticipantes = this._cargandoParticipantes.asReadonly();
  readonly errorParticipantes = this._errorParticipantes.asReadonly();

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
    sede: 'todas',
    modalidad: 'todas',
    programa: '',
  });

  readonly seleccionPrograma = this._seleccionPrograma.asReadonly();
  readonly filtro = this._filtro.asReadonly();

  constructor() {
    this.cargarProgramas();
  }

  cargarProgramas(): void {
    this._cargandoProgramas.set(true);
    this._errorProgramas.set(null);

    this.http.get<ProgramasApiResponse>(`${environment.urlApi}/matriculacion/programas`, {
      params: {
        gestion: 25,
        grado: 5,
        modalidad: 1,
        programa: "EDUCACIÓN SUPERIOR",
        pagina: 1,
        porPagina: 100,
      }
    }).subscribe({
      next: (respuesta) => {
        const mapeados = respuesta.data.map(this.mapearProgramaApi);
        this._programasApi.set(mapeados);
        this._cargandoProgramas.set(false);
      },
      error: (err) => {
        console.error('Error al cargar programas', err);
        this._errorProgramas.set('No se pudieron cargar los programas.');
        this._cargandoProgramas.set(false);
      },
    });
  }

  private mapearProgramaApi(item: ProgramaApi): Programa {
    return {
      id: item.id,
      nombre: item.programa,
      turno: '',
      version: item.version,
      gestion: String(item.gestion),
      sede: item.sede,
      modalidad: item.modalidad.toLowerCase(),
      tipoPrograma: item.grado_programa as TipoPrograma,
      matriculados: item.nroParticipantes.matriculados,
      preinscritos: item.nroParticipantes.preinscritos,
      numeroModulos: item.modulos?.cantidad ?? 0,
      modulosAsignados: item.modulos?.cantidadConNombramiento ?? 0,
      fechaInicio: item.fechaInicio ?? null,
      costosMatricula: item.costosMatricula && item.costosMatricula.length > 0 ? item.costosMatricula[0] : 0,
      docente: '',
      fechaRegistro: null,
      coordinador: '',
      coordinadorWhatsapp: '',
      habilitado: false,
    };
  }

  cargarParticipantes(idPrograma: number | string): void {
    this._cargandoParticipantes.set(true);
    this._errorParticipantes.set(null);

    this.participantesService.getParticipantes(idPrograma).subscribe({
      next: (respuesta) => {
        const mapeados = respuesta.data.map(this.mapearParticipanteApi);
        this._matriculas.set(mapeados);
        this._pagina.set(1);
        this._cargandoParticipantes.set(false);
      },
      error: (err) => {
        console.error('Error al cargar participantes', err);
        this._errorParticipantes.set('No se pudieron cargar los participantes.');
        this._matriculas.set([]);
        this._cargandoParticipantes.set(false);
      },
    });
  }

  private mapearParticipanteApi(item: ParticipanteApi): Matricula {
    const palabras = (item.nombre_completo ?? '').trim().split(/\s+/).filter(Boolean);
    const apellidos = palabras.slice(0, 2).join(' ');
    const nombres = palabras.slice(2).join(' ');

    const primeraMatricula = item.matriculas?.[0];
    const codigoMatricula = primeraMatricula ? Object.values(primeraMatricula)[0] : 0;
    const gestionMatricula = primeraMatricula ? Object.keys(primeraMatricula)[0] : '';

    return {
      id: Number(item.id_persona),
      codigo: String(codigoMatricula ?? ''),
      ci: item.ci,
      estudiante: {
        nombres,
        apellidos,
      },
      rude: '',
      ru: Number(item.registroUniversitario) || 0,
      curso: gestionMatricula,
      totalGrados: 0,
      tieneFoto: false,
      tieneBoleta: false,
      tutor: {
        nombre: '',
        parentesco: '',
      },
      contacto: {
        telefono: item.celular ?? '',
      },
      estado: 'activo',
    };
  }

  readonly programasFiltrados = computed(() => {
    const { version, gestion, sede, modalidad } = this._seleccionPrograma();
    return this._programasApi().filter(p => {
      if (version !== 'todas' && p.version !== version) return false;
      if (gestion && p.gestion !== gestion) return false;
      if (sede !== 'todas' && p.sede !== sede) return false;
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
    const programas = this._programasApi();
    return {
      todos: programas.length,
      diplomado: programas.filter(p => p.tipoPrograma === 'diplomado').length,
      especialidad: programas.filter(p => p.tipoPrograma === 'especialidad').length,
      maestria: programas.filter(p => p.tipoPrograma === 'maestria').length,
      doctorado: programas.filter(p => p.tipoPrograma === 'doctorado').length,
      postdoctorado: programas.filter(p => p.tipoPrograma === 'postdoctorado').length,
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