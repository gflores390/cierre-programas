import { TitleCasePipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectComponent, SelectOption } from '../../../../shared/components/form/select/select.component';
import { Programa, SeleccionPrograma } from '../../models';
import { NgClass } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-programa-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, TitleCasePipe, DatePipe, FormsModule, NgClass],
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
  readonly verEntregaMatriculas = output<Programa>();

  readonly versiones = computed<SelectOption[]>(() => {
    const unicas = Array.from(new Set(this.programas().map(p => p.version))).sort();
    return [{ value: 'todas', label: 'Todas' }, ...unicas.map(v => ({ value: v, label: v }))];
  });

  readonly sedes = computed<SelectOption[]>(() => {
    const unicas = Array.from(new Set(this.programas().map(p => p.sede)));
    return [{ value: 'todas', label: 'Todas' }, ...unicas.map(s => ({ value: s, label: s }))];
  });

  readonly gestiones: SelectOption[] = [
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
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
      `${p.nombre} ${p.modalidad} ${p.sede}`.toLowerCase().includes(termino)
    );
  });

  seleccionarPrograma(programa: Programa): void {
    this.programaChange.emit(programa);
  }

  cambiarPrograma(): void {
    this.busqueda.set('');
    this.programaChange.emit(null);
  }
  obtenerClasesEstado(matriculados: number): string {
 
  if (matriculados > 0) {
    return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400';
  }
  return 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400';
}
constructor(private location: Location) {}

volver() {
  this.location.back();
}
}
