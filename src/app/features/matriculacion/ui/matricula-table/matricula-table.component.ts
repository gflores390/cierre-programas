import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { BadgeComponent } from '../../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { TableDropdownComponent } from '../../../../shared/components/common/table-dropdown/table-dropdown.component';
import {
  ColumnDef,
  ColumnTemplateDirective,
  DataTableComponent,
} from '../../../../shared/components/data-table';
import { ModalService } from '../../../../core';
import { EstadoMatricula, Matricula } from '../../models';
import { DocumentoVisorModalComponent } from '../modals';

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

@Component({
  selector: 'app-matricula-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    BadgeComponent,
    ButtonComponent,
    TableDropdownComponent,
    DataTableComponent,
    ColumnTemplateDirective,
  ],
  templateUrl: './matricula-table.component.html',
})
export class MatriculaTableComponent {
  private readonly modalService = inject(ModalService);
  readonly matriculas = input.required<Matricula[]>();
  readonly paginaActual = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly porPagina = input<number>(10);
  readonly gestionActual = input<string>('2025');

  readonly paginaChange = output<number>();
  readonly verDetalle = output<Matricula>();
  readonly editar = output<Matricula>();
  readonly eliminar = output<Matricula>();
  readonly matricular = output<Matricula>();

  readonly pageIndex = computed(() => this.paginaActual() - 1);

  readonly columns: ColumnDef<Matricula>[] = [


    { key: 'indice',      header: 'Nº',              width: '56px' },
    { key: 'estudiante',  header: 'Apellidos y Nombres' },
    { key: 'ci',          header: 'Cedula Identidad',               width: '150px', value: (m) => m.ci }, 
    { key: 'celular',     header: 'Celular',              width: '110px', value: (m) => m.contacto.telefono },
    { key: 'foto',        header: 'Foto',                width: '80px',  align: 'center' },
    { key: 'boleta',      header: 'Boleta',              width: '80px',  align: 'center' },
    { key: 'ru',          header: 'Registro Posgraduante', width: '72px', align: 'center', value: (m) => m.ru },
    { key: 'totalGrados', header: 'Total Grados Academicos',     width: '140px', align: 'center' },
    { key: 'matricular',  header: '',                 width: '170px', align: 'right' },
    { key: 'acciones',    header: '',                 width: '52px',  align: 'right' },
  ];

  verDocumento(matricula: Matricula, tipo: 'foto' | 'boleta'): void {
    this.modalService.open(DocumentoVisorModalComponent, { matricula, tipo }, { size: 'lg' });
  }

  onPageChange(pageIndex: number): void {
    this.paginaChange.emit(pageIndex + 1);
  }

  indiceGlobal(index: number): number {
    return (this.paginaActual() - 1) * this.porPagina() + index + 1;
  }

  etiquetaEstado(estado: EstadoMatricula): string {
    const etiquetas: Record<EstadoMatricula, string> = {
      activo: 'Activo', suspendido: 'Suspendido', retirado: 'Retirado', egresado: 'Egresado',
    };
    return etiquetas[estado];
  }

  colorEstado(estado: EstadoMatricula): BadgeColor {
    const colores: Record<EstadoMatricula, BadgeColor> = {
      activo: 'success', suspendido: 'warning', retirado: 'error', egresado: 'info',
    };
    return colores[estado];
  }
}
