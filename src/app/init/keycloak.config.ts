import { environment } from '@environments/environment';
export const keycloakConfig = {
  config: {
    url: environment.urlKeycloak,
    realm: environment.realm,
    clientId: environment.clientId,
  },

  initOptions: {
    onLoad: 'login-required' as const,
    checkLoginIframe: false,
  },
}