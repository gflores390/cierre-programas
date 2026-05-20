import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { TableDropdownComponent } from '../../../../shared/components/common/table-dropdown/table-dropdown.component';
import {
  ColumnDef,
  ColumnTemplateDirective,
  DataTableComponent,
} from '../../../../shared/components/data-table';
import { EstadoMatricula, Matricula } from '../../models/matricula.model';

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

@Component({
  selector: 'app-matricula-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    BadgeComponent,
    TableDropdownComponent,
    DataTableComponent,
    ColumnTemplateDirective,
  ],
  templateUrl: './matricula-table.component.html',
})
export class MatriculaTableComponent {
  readonly matriculas = input.required<Matricula[]>();
  readonly paginaActual = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly porPagina = input<number>(10);

  readonly paginaChange = output<number>();
  readonly verDetalle = output<Matricula>();
  readonly editar = output<Matricula>();
  readonly eliminar = output<Matricula>();

  readonly pageIndex = computed(() => this.paginaActual() - 1);

  readonly columns: ColumnDef<Matricula>[] = [
    { key: 'indice', header: '#', width: '64px' },
    { key: 'estudiante', header: 'Estudiante' },
    { key: 'rude', header: 'RUDE', value: (m) => m.rude },
    { key: 'curso', header: 'Curso', value: (m) => m.curso },
    { key: 'tutor', header: 'Tutor' },
    { key: 'contacto', header: 'Contacto' },
    { key: 'estado', header: 'Estado' },
    { key: 'acciones', header: '', align: 'right', width: '64px' },
  ];

  onPageChange(pageIndex: number): void {
    this.paginaChange.emit(pageIndex + 1);
  }

  indiceGlobal(index: number): number {
    return (this.paginaActual() - 1) * this.porPagina() + index + 1;
  }

  etiquetaEstado(estado: EstadoMatricula): string {
    const etiquetas: Record<EstadoMatricula, string> = {
      activo: 'Activo',
      suspendido: 'Suspendido',
      retirado: 'Retirado',
      egresado: 'Egresado',
    };
    return etiquetas[estado];
  }

  colorEstado(estado: EstadoMatricula): BadgeColor {
    const colores: Record<EstadoMatricula, BadgeColor> = {
      activo: 'success',
      suspendido: 'warning',
      retirado: 'error',
      egresado: 'info',
    };
    return colores[estado];
  }
}
