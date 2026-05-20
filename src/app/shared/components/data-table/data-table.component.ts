import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from '../ui/button/button.component';
import { ColumnTemplateContext, ColumnTemplateDirective } from './column.directive';
import { ColumnDef, SortDir, SortState } from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly trackBy = input<(index: number, row: T) => unknown>();

  /** Tamaño de página. Si es 0 o no se setea, no se pagina */
  readonly pageSize = input<number>(0);
  /** Página actual (base-0) — controlada por el padre */
  readonly pageIndex = input<number>(0);
  /** Total de filas en el dataset (server-side). Si es null, se usa rows.length (client-side) */
  readonly totalRows = input<number | null>(null);

  readonly sort = input<SortState | null>(null);

  readonly loading = input<boolean>(false);
  readonly emptyMessage = input<string>('No hay resultados');
  /** Si true, oculta el contenedor de paginación (útil para tablas embebidas) */
  readonly hidePagination = input<boolean>(false);

  readonly pageIndexChange = output<number>();
  readonly sortChange = output<SortState>();
  readonly rowClick = output<T>();

  private readonly columnTemplates = contentChildren(ColumnTemplateDirective);

  readonly totalCount = computed(() => this.totalRows() ?? this.rows().length);
  readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (!size) return 1;
    return Math.max(1, Math.ceil(this.totalCount() / size));
  });
  readonly currentPage = computed(() => this.pageIndex() + 1);

  readonly rangeStart = computed(() => {
    if (!this.totalCount()) return 0;
    return this.pageIndex() * this.pageSize() + 1;
  });
  readonly rangeEnd = computed(() => {
    const end = (this.pageIndex() + 1) * this.pageSize();
    return Math.min(end, this.totalCount());
  });

  templateFor(key: string): TemplateRef<ColumnTemplateContext<T>> | null {
    const found = this.columnTemplates().find((t) => t.appColumn() === key);
    return (found?.template as TemplateRef<ColumnTemplateContext<T>>) ?? null;
  }

  cellValue(row: T, col: ColumnDef<T>): unknown {
    if (col.value) return col.value(row);
    return (row as Record<string, unknown>)[col.key];
  }

  defaultTrackBy = (index: number, row: T): unknown => {
    const tb = this.trackBy();
    if (tb) return tb(index, row);
    return (row as Record<string, unknown>)['id'] ?? index;
  };

  onSort(col: ColumnDef<T>): void {
    if (!col.sortable) return;
    const current = this.sort();
    const dir: SortDir =
      current?.key === col.key && current.dir === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key: col.key, dir });
  }

  goToPage(page: number): void {
    const next = Math.max(0, Math.min(page, this.totalPages() - 1));
    if (next !== this.pageIndex()) this.pageIndexChange.emit(next);
  }

  alignClass(col: ColumnDef<T>): string {
    switch (col.align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-end';
      default:
        return 'text-start';
    }
  }

  pageNumbers(): (number | null)[] {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | null)[] = [1];
    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);

    if (rangeStart > 2) pages.push(null);
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < total - 1) pages.push(null);
    pages.push(total);

    return pages;
  }
}
