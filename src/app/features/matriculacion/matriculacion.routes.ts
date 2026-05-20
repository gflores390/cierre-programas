import { Routes } from '@angular/router';

export const MATRICULACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/matriculacion-page/matriculacion-page.component').then(
        (m) => m.MatriculacionPageComponent,
      ),
    title: 'Matriculación',
  },
];
