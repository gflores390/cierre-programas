import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ModalService } from '../../../../../core';
import { BadgeComponent } from '../../../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

type Formato = 'pdf' | 'excel';

@Component({
  selector: 'app-descarga-listado-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, BadgeComponent],
  templateUrl: './descarga-listado-modal.component.html',
})
export class DescargaListadoModalComponent {
  readonly programa  = input.required<string>();
  readonly gestion   = input.required<string>();
  readonly total     = input<number>(0);

  private readonly modalService = inject(ModalService);

  readonly formato   = signal<Formato>('pdf');
  readonly incluirCI      = signal(true);
  readonly incluirContacto = signal(true);
  readonly incluirEstado  = signal(true);
  readonly descargando    = signal(false);

  seleccionarFormato(f: Formato): void {
    this.formato.set(f);
  }

  onCerrar(): void {
    this.modalService.close();
  }

  onDescargar(): void {
    this.descargando.set(true);
    // Simulación — aquí iría la llamada al servicio de exportación
    setTimeout(() => {
      console.log('Descargar', {
        formato: this.formato(),
        programa: this.programa(),
        gestion: this.gestion(),
        opciones: {
          incluirCI:       this.incluirCI(),
          incluirContacto: this.incluirContacto(),
          incluirEstado:   this.incluirEstado(),
        },
      });
      this.descargando.set(false);
      this.modalService.close();
    }, 1200);
  }
}
