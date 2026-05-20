import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card p-6">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Página principal en construcción.</p>
    </div>
  `,
})
export class DashboardPageComponent {}
