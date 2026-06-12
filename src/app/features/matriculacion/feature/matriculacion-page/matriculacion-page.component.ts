import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalService } from '../../../../core';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MatriculaService } from '../../data';
import { EstadoMatricula, Matricula, Programa } from '../../models';
import {
  DescargaListadoModalComponent,
  MatriculaTableComponent,
  MatriculaToolbarComponent,
  MatricularModalComponent,
  ProgramaSelectorComponent,
} from '../../ui';

@Component({
  selector: 'app-matriculacion-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('900ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  imports: [
    PageBreadcrumbComponent,
    ProgramaSelectorComponent,
    MatriculaToolbarComponent,
    MatriculaTableComponent,
  ],
  templateUrl: './matriculacion-page.component.html',
})
export class MatriculacionPageComponent {
  private readonly matriculaService = inject(MatriculaService);
  private readonly modalService     = inject(ModalService);

  readonly filtro             = this.matriculaService.filtro;
  readonly seleccionPrograma  = this.matriculaService.seleccionPrograma;
  readonly programasFiltrados = this.matriculaService.programasFiltrados;
  readonly conteoPorEstado    = this.matriculaService.conteoPorEstado;
  readonly matriculas         = this.matriculaService.paginaActual;
  readonly pagina             = this.matriculaService.pagina;
  readonly totalPaginas       = this.matriculaService.totalPaginas;
  readonly porPagina          = this.matriculaService.porPagina;
  readonly totalFiltradas     = this.matriculaService.matriculasFiltradas;

  onMatricular(matricula: Matricula): void {
    this.modalService.open(
      MatricularModalComponent,
      {
        matricula,
        gestion: this.filtro().gestion,
        programa: this.seleccionPrograma().programa,
      },
      { size: '2xl' }
    );
  }

  onBusquedaChange(termino: string): void { this.matriculaService.actualizarBusqueda(termino); }
  onEstadoChange(estado: EstadoMatricula | 'todos'): void { this.matriculaService.actualizarEstado(estado); }
  onGestionChange(gestion: string): void  { this.matriculaService.actualizarGestion(gestion); }
  onPeriodoChange(periodo: string): void  { this.matriculaService.actualizarPeriodo(periodo); }
  onPaginaChange(pagina: number): void    { this.matriculaService.irAPagina(pagina); }

  onNuevaMatricula(): void { console.log('Nueva matrícula'); }
  onExportar(): void       { console.log('Exportar matrículas'); }
  onAbrirFiltros(): void   { console.log('Abrir filtros avanzados'); }
  onVerDetalle(m: Matricula): void { console.log('Ver detalle', m); }
  onEditar(m: Matricula): void     { console.log('Editar', m); }
  onEliminar(m: Matricula): void   { console.log('Eliminar', m); }

  onVersionChange(version: string): void {
    this.matriculaService.actualizarSeleccionPrograma({ version });
  }
  onSedeChange(sede: string): void {
    this.matriculaService.actualizarSeleccionPrograma({ sede });
  }
  onModalidadChange(modalidad: string): void {
    this.matriculaService.actualizarSeleccionPrograma({ modalidad });
  }
  onGestionProgramaChange(gestion: string): void {
    this.matriculaService.actualizarSeleccionPrograma({ gestion });
    this.matriculaService.actualizarGestion(gestion);
  }
  onProgramaChange(programa: Programa | null): void {
    const nombre = programa ? `${programa.nombre} — Turno ${programa.turno}` : '';
    this.matriculaService.actualizarSeleccionPrograma({ programa: nombre });
  }
  onVerDetallePrograma(): void {
    console.log('Ver detalle del programa', this.seleccionPrograma());
  }

  onDescargarListado(): void {
    this.modalService.open(
      DescargaListadoModalComponent,
      {
        programa: this.seleccionPrograma().programa,
        gestion:  this.filtro().gestion,
        total:    this.matriculaService.matriculasFiltradas().length,
      },
      { size: 'sm' }
    );
  }
}
