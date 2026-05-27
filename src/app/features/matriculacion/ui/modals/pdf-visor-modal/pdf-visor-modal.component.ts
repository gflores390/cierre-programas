import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ModalService } from '../../../../../core';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-pdf-visor-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxExtendedPdfViewerModule, ButtonComponent],
  templateUrl: './pdf-visor-modal.component.html',
})
export class PdfVisorModalComponent {
  readonly src       = input.required<Uint8Array>();
  readonly titulo    = input<string>('Vista previa del listado');
  readonly subtitulo = input<string>('');

  private readonly modalService = inject(ModalService);

  onCerrar(): void {
    this.modalService.close();
  }
}
