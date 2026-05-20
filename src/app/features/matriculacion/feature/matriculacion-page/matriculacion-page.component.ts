import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { MatriculaService } from '../../data/matricula.service';
import { EstadoMatricula, Matricula } from '../../models/matricula.model';
import { MatriculaTableComponent } from '../../ui/matricula-table/matricula-table.component';
import { MatriculaToolbarComponent } from '../../ui/matricula-toolbar/matricula-toolbar.component';
import { ProgramaSelectorComponent } from '../../ui/programa-selector/programa-selector.component';

@Component({
  selector: 'app-matriculacion-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  readonly filtro = this.matriculaService.filtro;
  readonly seleccionPrograma = this.matriculaService.seleccionPrograma;
  readonly conteoPorEstado = this.matriculaService.conteoPorEstado;
  readonly matriculas = this.matriculaService.paginaActual;
  readonly pagina = this.matriculaService.pagina;
  readonly totalPaginas = this.matriculaService.totalPaginas;
  readonly porPagina = this.matriculaService.porPagina;
  readonly totalFiltradas = this.matriculaService.matriculasFiltradas;

  onBusquedaChange(termino: string): void {
    this.matriculaService.actualizarBusqueda(termino);
  }

  onEstadoChange(estado: EstadoMatricula | 'todos'): void {
    this.matriculaService.actualizarEstado(estado);
  }

  onGestionChange(gestion: string): void {
    this.matriculaService.actualizarGestion(gestion);
  }

  onPeriodoChange(periodo: string): void {
    this.matriculaService.actualizarPeriodo(periodo);
  }

  onPaginaChange(pagina: number): void {
    this.matriculaService.irAPagina(pagina);
  }

  onNuevaMatricula(): void {
    console.log('Nueva matrícula');
  }

  onExportar(): void {
    console.log('Exportar matrículas');
  }

  onAbrirFiltros(): void {
    console.log('Abrir filtros avanzados');
  }

  onVerDetalle(matricula: Matricula): void {
    console.log('Ver detalle', matricula);
  }

  onEditar(matricula: Matricula): void {
    console.log('Editar', matricula);
  }

  onEliminar(matricula: Matricula): void {
    console.log('Eliminar', matricula);
  }

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

  onVerDetallePrograma(): void {
    console.log('Ver detalle del programa', this.seleccionPrograma());
  }
}
