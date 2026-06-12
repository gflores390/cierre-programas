/** Datos de perfil mostrados en la cabecera de bienvenida del dashboard. */
export interface PerfilUsuario {
  readonly nombre: string;
  readonly ci: string;
  readonly telefono: string;
  readonly email: string;
  readonly avatarUrl: string;
}

/** Subsistema desplegable dentro de una tarjeta de sistema. */
export interface Subsistema {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly url: string;
}

/** Tarjeta de acceso a un sistema del posgrado, con subsistemas opcionales. */
export interface SistemaAcceso {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly url: string;
  readonly subsistemas?: readonly Subsistema[];
}
