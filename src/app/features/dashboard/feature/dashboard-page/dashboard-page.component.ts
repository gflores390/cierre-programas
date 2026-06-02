import { animate, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { DashboardService } from '../../data';
import { Subsistema } from '../../models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html',
  animations: [
    trigger('desplegar', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class DashboardPageComponent {
  private readonly dashboard = inject(DashboardService);

  readonly perfil = this.dashboard.perfil;
  readonly busqueda = this.dashboard.busqueda;
  readonly sistemasFiltrados = this.dashboard.sistemasFiltrados;

  readonly estaExpandido = (id: string) => this.dashboard.estaExpandido(id);
  readonly esFavorito = (id: string) => this.dashboard.esFavorito(id);

  alternar(id: string): void {
    this.dashboard.alternarExpandido(id);
  }

  alternarFavorito(id: string): void {
    this.dashboard.alternarFavorito(id);
  }

  onBusqueda(event: Event): void {
    this.dashboard.setBusqueda((event.target as HTMLInputElement).value);
  }

  /** Abre el sistema/subsistema en una pestaña nueva (acción de navegación). */
  ingresar(item: Pick<Subsistema, 'url'>): void {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank', 'noopener');
    }
  }
}
