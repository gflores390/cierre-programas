import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, SelectOption } from '../../../../shared/components/form/select/select.component';
import { Programa, SeleccionPrograma } from '../../models';

@Component({
  selector: 'app-programa-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, TitleCasePipe, FormsModule],
  templateUrl: './programa-selector.component.html',
})
export class ProgramaSelectorComponent {
  readonly seleccion = input.required<SeleccionPrograma>();
  readonly programas = input.required<Programa[]>();

  readonly versionChange = output<string>();
  readonly gestionChange = output<string>();
  readonly sedeChange = output<string>();
  readonly modalidadChange = output<string>();
  readonly programaChange = output<Programa | null>();
  readonly verDetalle = output<void>();
  readonly descargarListado = output<void>();

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

  readonly busqueda = signal('');

  readonly programasVisibles = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) return this.programas();
    return this.programas().filter(p =>
      `${p.nombre} ${p.turno} ${p.modalidad}`.toLowerCase().includes(termino)
    );
  });

  seleccionarPrograma(programa: Programa): void {
    this.programaChange.emit(programa);
  }

  cambiarPrograma(): void {
    this.busqueda.set('');
    this.programaChange.emit(null);
  }
}
