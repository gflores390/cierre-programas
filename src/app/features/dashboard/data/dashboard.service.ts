import { computed, Injectable, signal } from '@angular/core';
import { PerfilUsuario, SistemaAcceso } from '../models';

/**
 * Fuente de datos y estado del dashboard.
 *
 * Hoy los datos son fijos (seed). Cuando exista backend, basta con reemplazar
 * `PERFIL_SEED` / `SISTEMAS_SEED` por llamadas HTTP (resource/httpResource o un
 * repositorio inyectado) sin tocar el componente de presentación.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly _perfil = signal<PerfilUsuario>(PERFIL_SEED);
  private readonly _sistemas = signal<readonly SistemaAcceso[]>(SISTEMAS_SEED);
  private readonly _busqueda = signal('');
  private readonly _expandidos = signal<ReadonlySet<string>>(new Set());
  private readonly _favoritos = signal<ReadonlySet<string>>(new Set());

  /** Perfil del usuario autenticado. */
  readonly perfil = this._perfil.asReadonly();

  /** Texto del buscador. */
  readonly busqueda = this._busqueda.asReadonly();

  /** Sistemas filtrados por el término de búsqueda (incluye match en subsistemas). */
  readonly sistemasFiltrados = computed(() => {
    const termino = this._busqueda().trim().toLowerCase();
    if (!termino) return this._sistemas();
    return this._sistemas().filter(
      (s) =>
        s.titulo.toLowerCase().includes(termino) ||
        s.descripcion.toLowerCase().includes(termino) ||
        s.subsistemas?.some(
          (sub) =>
            sub.titulo.toLowerCase().includes(termino) ||
            sub.descripcion.toLowerCase().includes(termino),
        ),
    );
  });

  setBusqueda(valor: string): void {
    this._busqueda.set(valor);
  }

  estaExpandido(id: string): boolean {
    return this._expandidos().has(id);
  }

  esFavorito(id: string): boolean {
    return this._favoritos().has(id);
  }

  alternarExpandido(id: string): void {
    this._expandidos.update((prev) => toggle(prev, id));
  }

  alternarFavorito(id: string): void {
    this._favoritos.update((prev) => toggle(prev, id));
  }
}

/** Devuelve un nuevo Set con `id` alternado (necesario para disparar el signal). */
function toggle(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}

const PERFIL_SEED: PerfilUsuario = {
  nombre: 'Sergio Luis Yujra Torrez',
  ci: '11547715',
  telefono: '73736972',
  email: 'sergioyujra@gmail.com',
  avatarUrl: '/images/user/owner.jpg',
};

const SISTEMAS_SEED: readonly SistemaAcceso[] = [
  {
    id: 'integrado',
    titulo: 'Sistema Integrado Posgrado',
    descripcion: 'Sistema administrativo',
    url: '#',
    subsistemas: [
      {
        id: 'integrado-ddjj',
        titulo: 'Declaraciones Juradas (SDJ)',
        descripcion: 'Sistema de Declaraciones Juradas',
        url: '#',
      },
      {
        id: 'integrado-reportes',
        titulo: 'Reportes administrativos',
        descripcion: 'Reportes y estadísticas',
        url: '#',
      },
    ],
  },
  {
    id: 'academico',
    titulo: 'Sistema Academico Posgraduante',
    descripcion: 'Notas, Pagos, Matriculas...',
    url: '#',
    subsistemas: [
      {
        id: 'academico-notas',
        titulo: 'Gestión de Notas',
        descripcion: 'Registro y consulta de calificaciones',
        url: '#',
      },
      {
        id: 'academico-pagos',
        titulo: 'Pagos en Línea',
        descripcion: 'Aranceles y comprobantes',
        url: '#',
      },
    ],
  },
  {
    id: 'tramites',
    titulo: 'Sistema Tramites en Linea',
    descripcion: 'Solicitud y Seguimiento de Trámites',
    url: '#',
    subsistemas: [
      {
        id: 'tramites-solicitud',
        titulo: 'Nueva Solicitud',
        descripcion: 'Inicia un trámite',
        url: '#',
      },
      {
        id: 'tramites-seguimiento',
        titulo: 'Seguimiento',
        descripcion: 'Estado de tus trámites',
        url: '#',
      },
    ],
  },
];
