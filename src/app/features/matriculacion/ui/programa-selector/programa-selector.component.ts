import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/form/select/select.component';
import { SeleccionPrograma } from '../../models/matricula.model';

@Component({
  selector: 'app-programa-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, SelectComponent],
  templateUrl: './programa-selector.component.html',
})
export class ProgramaSelectorComponent {
  readonly seleccion = input.required<SeleccionPrograma>();

  readonly versionChange = output<string>();
  readonly gestionChange = output<string>();
  readonly sedeChange = output<string>();
  readonly modalidadChange = output<string>();
  readonly verDetalle = output<void>();

  readonly versiones: SelectOption[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'v1', label: 'Versión 1' },
    { value: 'v2', label: 'Versión 2' },
  ];

  readonly gestiones: SelectOption[] = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

  readonly sedes: SelectOption[] = [
    { value: 'central', label: 'Sede Central' },
    { value: 'norte', label: 'Sede Norte' },
    { value: 'sur', label: 'Sede Sur' },
  ];

  readonly modalidades: SelectOption[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'semipresencial', label: 'Semipresencial' },
  ];

  readonly programaCompleto = computed(() => this.seleccion().programa);
}
