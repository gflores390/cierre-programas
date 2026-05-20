import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ModalService } from '../../../../../core';
import { BadgeComponent } from '../../../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { Matricula } from '../../../models';

@Component({
  selector: 'app-matricular-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, BadgeComponent, TitleCasePipe],
  templateUrl: './matricular-modal.component.html',
})
export class MatricularModalComponent {
  readonly matricula = input.required<Matricula>();
  readonly gestion   = input.required<string>();
  readonly programa  = input.required<string>();

  private readonly modalService = inject(ModalService);

  onCerrar(): void {
    this.modalService.close();
  }

  onConfirmar(): void {
    console.log('Confirmar matrícula', this.matricula(), this.gestion());
    this.modalService.close();
  }
}
