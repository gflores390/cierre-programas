import { Routes } from '@angular/router';

export const FORMULARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./formularios.component').then((m) => m.FormulariosComponent),
    title: 'Formularios e Informes - Posgrado UPEA',
  },
];
