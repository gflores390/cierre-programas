import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../core';
import { BadgeComponent } from '../../../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { SelectComponent, SelectOption } from '../../../../../shared/components/form/select/select.component';
import { Deposito, Matricula } from '../../../models';

type BadgeColor = 'success' | 'warning' | 'error';

@Component({
  selector: 'app-matricular-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, BadgeComponent, TitleCasePipe, FormsModule, SelectComponent],
  templateUrl: './matricular-modal.component.html',
})
export class MatricularModalComponent {
  readonly matricula = input.required<Matricula>();
  readonly gestion   = input.required<string>();
  readonly programa  = input.required<string>();

  private readonly modalService = inject(ModalService);

  readonly ciNumero  = computed(() => this.matricula().ci.split(' ')[0]);
  readonly expedido  = computed(() => this.matricula().ci.split(' ')[1] ?? '');
  readonly depositos = computed(() => this.matricula().depositos ?? []);

  // Campos editables
  readonly estadoCivil = linkedSignal(() => this.matricula().estadoCivil ?? '');
  readonly celular     = linkedSignal(() => this.matricula().contacto.telefono);
  readonly celularRef  = linkedSignal(() => this.matricula().contacto.celularReferencia ?? '');
  readonly email       = linkedSignal(() => this.matricula().contacto.email ?? '');
  readonly domicilio   = linkedSignal(() => this.matricula().domicilio ?? '');

  readonly estadoCivilOpciones: SelectOption[] = [
    { value: 'soltero',     label: 'Soltero(a)' },
    { value: 'casado',      label: 'Casado(a)' },
    { value: 'divorciado',  label: 'Divorciado(a)' },
    { value: 'viudo',       label: 'Viudo(a)' },
    { value: 'conviviente', label: 'Conviviente' },
  ];

  colorDeposito(estado: Deposito['estado']): BadgeColor {
    const mapa: Record<Deposito['estado'], BadgeColor> = {
      comprobado: 'success',
      pendiente:  'warning',
      rechazado:  'error',
    };
    return mapa[estado];
  }

  onCerrar(): void {
    this.modalService.close();
  }

  onConfirmar(): void {
    console.log('Confirmar matrícula', {
      id: this.matricula().id,
      estadoCivil: this.estadoCivil(),
      contacto: {
        telefono:          this.celular(),
        celularReferencia: this.celularRef(),
        email:             this.email(),
      },
      domicilio: this.domicilio(),
    });
    this.modalService.close();
  }
}
