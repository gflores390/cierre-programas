import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ModalService } from '../../../../../core';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { MatriculaPdfService, MatriculaService } from '../../../data';
import { PdfVisorModalComponent } from '../pdf-visor-modal/pdf-visor-modal.component';

type Formato = 'pdf' | 'excel';

@Component({
  selector: 'app-descarga-listado-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './descarga-listado-modal.component.html',
})
export class DescargaListadoModalComponent {
  readonly programa  = input.required<string>();
  readonly gestion   = input.required<string>();
  readonly total     = input<number>(0);

  private readonly modalService    = inject(ModalService);
  private readonly matriculaSvc    = inject(MatriculaService);
  private readonly pdfSvc          = inject(MatriculaPdfService);

  readonly formato         = signal<Formato>('pdf');
  readonly incluirCI       = signal(true);
  readonly incluirContacto = signal(true);
  readonly incluirEstado   = signal(true);
  readonly descargando     = signal(false);

  seleccionarFormato(f: Formato): void {
    this.formato.set(f);
  }

  onCerrar(): void {
    this.modalService.close();
  }

  onDescargar(): void {
    if (this.formato() === 'pdf') {
      this.descargando.set(true);

      // Pequeño delay para mostrar el spinner antes de generar
      setTimeout(() => {
        const sel        = this.matriculaSvc.seleccionPrograma();
        const matriculas = this.matriculaSvc.matriculasFiltradas();

        const pdfBytes = this.pdfSvc.generarListado(matriculas, {
          programa:  this.programa(),
          unidad:    `CENTRAL - POSGRADO - ${sel.sede.toUpperCase()}`,
          version:   sel.version === 'todas' ? 'II' : sel.version.toUpperCase(),
          modalidad: sel.modalidad === 'todas' ? 'VIRTUAL' : sel.modalidad.toUpperCase(),
          gestion:   this.gestion(),
        });

        this.modalService.close();
        this.modalService.open(
          PdfVisorModalComponent,
          {
            src:       pdfBytes,
            titulo:    'Listado de matriculados',
            subtitulo: `${matriculas.length} registros · Gestión ${this.gestion()}`,
          },
          { size: 'full' }
        );
      }, 400);

    } else {
      console.log('[Descarga] Excel — pendiente de implementar');
      this.modalService.close();
    }
  }
}
