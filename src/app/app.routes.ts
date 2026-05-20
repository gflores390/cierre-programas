import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'matriculacion',
        loadChildren: () =>
          import('./features/matriculacion/matriculacion.routes').then(
            (m) => m.MATRICULACION_ROUTES,
          ),
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - No encontrado',
  },
];
