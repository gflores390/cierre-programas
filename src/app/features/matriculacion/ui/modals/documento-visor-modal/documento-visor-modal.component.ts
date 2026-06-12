import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../core';
import { BadgeComponent } from '../../../../../shared/components/ui/badge/badge.component';
import { Matricula } from '../../../models';

@Component({
  selector: 'app-documento-visor-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, TitleCasePipe, FormsModule],
  templateUrl: './documento-visor-modal.component.html',
})
export class DocumentoVisorModalComponent {
  readonly matricula = input.required<Matricula>();
  readonly tipo      = input.required<'foto' | 'boleta'>();

  private readonly modalService = inject(ModalService);

  // Tab activo — arranca con el valor del input pero es escribible
  readonly tipoActivo = linkedSignal(() => this.tipo());

  readonly observacion = signal('');
  readonly enviosCount = signal(0);

  readonly tieneDocumento = computed(() =>
    this.tipoActivo() === 'foto' ? this.matricula().tieneFoto : this.matricula().tieneBoleta,
  );

  readonly mensajePredeterminado = computed(() => {
    const tipoLabel = this.tipoActivo() === 'foto' ? 'foto de identificación' : 'boleta de pago';
    const nombre = `${this.matricula().estudiante.nombres} ${this.matricula().estudiante.apellidos}`;
    return this.tieneDocumento()
      ? `Estimado/a ${nombre}, le informamos que su ${tipoLabel} no cumple los requisitos. Por favor vuelva a subir el documento correcto. Gracias.`
      : `Estimado/a ${nombre}, aún no ha subido su ${tipoLabel}. Por favor súbala lo antes posible para continuar con el proceso de matrícula. Gracias.`;
  });

  seleccionarTab(tab: 'foto' | 'boleta'): void {
    this.tipoActivo.set(tab);
    this.observacion.set('');
    this.enviosCount.set(0);
  }

  onCerrar(): void {
    this.modalService.close();
  }

  onEnviarWhatsApp(): void {
    const telefono = this.matricula().contacto.telefono;
    const mensaje  = this.observacion().trim() || this.mensajePredeterminado();
    const numero   = `591${telefono.replace(/\s/g, '')}`;
    const url      = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    this.enviosCount.update(c => c + 1);
  }
}
