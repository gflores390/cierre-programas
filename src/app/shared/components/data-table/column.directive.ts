import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Directiva estructural ligera para registrar templates por columna.
 *
 * Uso:
 * ```html
 * <ng-template appColumn="estado" [appColumnTypeOf]="rows" let-row>
 *   <app-badge>{{ row.estado }}</app-badge>
 * </ng-template>
 * ```
 *
 * `appColumnTypeOf` es solo un marker para inferencia de tipos — pasa el array
 * de filas y TypeScript inferirá el tipo de `row` automáticamente.
 *
 * El template recibe la fila como `$implicit` y `row` (alias),
 * y `index` con el índice global de la fila.
 */
@Directive({
  selector: '[appColumn]',
  standalone: true,
})
export class ColumnTemplateDirective<T = unknown> {
  readonly appColumn = input.required<string>();
  /** Marker de tipo — pasa el array de filas (o una fila) para inferencia */
  readonly appColumnTypeOf = input<T[] | T | null | undefined>(undefined);
  readonly template = inject<TemplateRef<ColumnTemplateContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: ColumnTemplateDirective<T>,
    ctx: unknown,
  ): ctx is ColumnTemplateContext<T> {
    return true;
  }
}

export interface ColumnTemplateContext<T> {
  $implicit: T;
  row: T;
  index: number;
}
