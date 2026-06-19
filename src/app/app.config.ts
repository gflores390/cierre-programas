import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideKeycloak } from 'keycloak-angular';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { keycloakConfig } from './init/keycloak.config';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';


 registerLocaleData(localeEsBo, 'es-BO');
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideKeycloak(keycloakConfig),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    {provide : LOCALE_ID, useValue: 'es-BO' },
  ],
};
