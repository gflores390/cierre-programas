import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideKeycloak } from 'keycloak-angular';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { keycloakConfig } from './init/keycloak.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideKeycloak(keycloakConfig),
  ]
};
