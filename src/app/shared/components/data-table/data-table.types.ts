export type SortDir = 'asc' | 'desc';

export type ColumnAlign = 'left' | 'center' | 'right';

export interface ColumnDef<T> {
  /** Identificador único de la columna — se usa para templates personalizados y ordenamiento */
  key: string;
  /** Etiqueta a mostrar en el header */
  header: string;
  /** Si true, el header es clickeable para ordenar */
  sortable?: boolean;
  /** Alineación de la celda y el header */
  align?: ColumnAlign;
  /** CSS width (ej: "120px", "20%"). Por defecto auto */
  width?: string;
  /** Clases extra aplicadas al &lt;td&gt; de esta columna */
  cellClass?: string;
  /** Clases extra aplicadas al &lt;th&gt; de esta columna */
  headerClass?: string;
  /** Extractor de valor para renderizado por defecto cuando no hay template */
  value?: (row: T) => unknown;
}

export interface SortState {
  key: string;
  dir: SortDir;
}

export interface PageChangeEvent {
  /** índice base-0 de la página solicitada */
  pageIndex: number;
}
