import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/form/select/select.component';
import { EstadoMatricula } from '../../models';

type EstadoFiltro = EstadoMatricula | 'todos';

interface FiltroEstadoOpcion {
  valor: EstadoFiltro;
  etiqueta: string;
}

@Component({
  selector: 'app-matricula-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, SelectComponent],
  templateUrl: './matricula-toolbar.component.html',
})
export class MatriculaToolbarComponent {
  readonly busqueda = input<string>('');
  readonly estado = input<EstadoFiltro>('todos');
  readonly gestion = input<string>('2025');
  readonly periodo = input<string>('anual');
  readonly conteoPorEstado = input.required<Record<EstadoFiltro, number>>();

  readonly busquedaChange = output<string>();
  readonly estadoChange = output<EstadoFiltro>();
  readonly gestionChange = output<string>();
  readonly periodoChange = output<string>();
  readonly nuevaMatricula = output<void>();
  readonly exportar = output<void>();
  readonly abrirFiltros = output<void>();

  readonly filtrosEstado: FiltroEstadoOpcion[] = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'activo', etiqueta: 'Activos' },
    { valor: 'suspendido', etiqueta: 'Suspendidos' },
    { valor: 'retirado', etiqueta: 'Retirados' },
    { valor: 'egresado', etiqueta: 'Egresados' },
  ];

  readonly gestiones: SelectOption[] = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

  readonly periodos: SelectOption[] = [
    { value: 'anual', label: 'Anual' },
    { value: '1er-trimestre', label: '1er Trimestre' },
    { value: '2do-trimestre', label: '2do Trimestre' },
    { value: '3er-trimestre', label: '3er Trimestre' },
  ];

  onBusquedaInput(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busquedaChange.emit(valor);
  }
}
