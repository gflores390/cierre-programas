# Estrategia Multi-API

Cuando tu app consume varias APIs de distintos orígenes (backend propio, Stripe, una API analítica, un CRM, etc.), cada una con su propio dominio, autenticación, y forma de manejar errores.

## Principios

1. **Cada API tiene su propio cliente** en una feature o en `core/integrations/`.
2. **Cada API tiene su propio token de URL** (`InjectionToken`).
3. **Cada API tiene su propio interceptor de auth** (o lógica condicional por URL).
4. **Errores de cada API se mapean a un tipo común** (`AppError`) antes de viajar a la UI.

## Estructura

```
src/app/core/
├── integrations/
│   ├── stripe/
│   │   ├── stripe.client.ts
│   │   ├── stripe.interceptor.ts
│   │   ├── stripe.types.ts
│   │   └── stripe.mapper.ts
│   ├── analytics/
│   │   ├── analytics.client.ts
│   │   └── analytics.types.ts
│   └── crm/
│       └── crm.client.ts
└── http/
    └── error.mapper.ts   # Mapea cualquier error HTTP a AppError
```

Las integraciones VIVEN en `core/integrations/` porque son singletons globales. Pero si una integración es exclusiva de UNA feature, ponla dentro de esa feature.

## InjectionTokens por API

```typescript
// core/config/environment.tokens.ts
import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
export const STRIPE_API_URL = new InjectionToken<string>('STRIPE_API_URL');
export const STRIPE_PUBLIC_KEY = new InjectionToken<string>('STRIPE_PUBLIC_KEY');
export const ANALYTICS_API_URL = new InjectionToken<string>('ANALYTICS_API_URL');
export const ANALYTICS_API_KEY = new InjectionToken<string>('ANALYTICS_API_KEY');
export const CRM_API_URL = new InjectionToken<string>('CRM_API_URL');
```

Provistos en `app.config.ts`:

```typescript
import { environment } from '@env/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    { provide: STRIPE_API_URL, useValue: environment.stripe.url },
    { provide: STRIPE_PUBLIC_KEY, useValue: environment.stripe.publicKey },
    { provide: ANALYTICS_API_URL, useValue: environment.analytics.url },
    { provide: ANALYTICS_API_KEY, useValue: environment.analytics.apiKey },
    { provide: CRM_API_URL, useValue: environment.crm.url },
    provideCore(),
    provideRouter(routes),
  ],
};
```

## Interceptors condicionales por URL

UN solo `HttpClient` puede servir a varias APIs si los interceptors saben qué hacer según la URL.

```typescript
// core/integrations/stripe/stripe.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { STRIPE_API_URL, STRIPE_PUBLIC_KEY } from '@core/config/environment.tokens';

export const stripeInterceptor: HttpInterceptorFn = (req, next) => {
  const stripeUrl = inject(STRIPE_API_URL);
  const stripeKey = inject(STRIPE_PUBLIC_KEY);

  if (!req.url.startsWith(stripeUrl)) {
    return next(req);
  }

  const modified = req.clone({
    setHeaders: {
      Authorization: `Bearer ${stripeKey}`,
      'Stripe-Version': '2024-10-28',
    },
  });
  return next(modified);
};
```

```typescript
// core/auth/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from '@core/config/environment.tokens';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_BASE_URL);
  const auth = inject(AuthService);

  // Solo añade auth a NUESTRA API, no a las externas
  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  const token = auth.getToken();
  if (!token) return next(req);

  const modified = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(modified);
};
```

Registro:

```typescript
// app.config.ts
provideHttpClient(
  withInterceptors([
    authInterceptor,
    stripeInterceptor,
    analyticsInterceptor,
    errorInterceptor,    // último, captura todo
  ]),
),
```

## Cliente API por integración

Cada integración extiende una base o implementa una interfaz común.

```typescript
// core/integrations/stripe/stripe.client.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { STRIPE_API_URL } from '@core/config/environment.tokens';
import { StripeCustomerDto, StripeChargeDto } from './stripe.types';

@Injectable({ providedIn: 'root' })
export class StripeClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(STRIPE_API_URL);

  createCustomer(email: string): Observable<StripeCustomerDto> {
    return this.http.post<StripeCustomerDto>(
      `${this.baseUrl}/customers`,
      { email },
    );
  }

  createCharge(amount: number, customerId: string): Observable<StripeChargeDto> {
    return this.http.post<StripeChargeDto>(
      `${this.baseUrl}/charges`,
      { amount, currency: 'usd', customer: customerId },
    );
  }
}
```

## Mapeo de errores unificado

Cada API devuelve errores en su propio formato. Mapéalos a un tipo común antes de mostrarlos.

```typescript
// shared/types/app-error.type.ts
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly source: 'internal' | 'stripe' | 'analytics' | 'crm' | 'network' | 'unknown';
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;
}
```

```typescript
// core/http/error.mapper.ts
import { HttpErrorResponse } from '@angular/common/http';
import { AppError } from '@shared/types/app-error.type';

export function mapHttpError(error: HttpErrorResponse, baseUrls: {
  internal: string;
  stripe: string;
  analytics: string;
  crm: string;
}): AppError {
  const source = detectSource(error.url ?? '', baseUrls);

  if (source === 'stripe') {
    return {
      code: error.error?.error?.code ?? 'stripe_error',
      message: error.error?.error?.message ?? 'Stripe error',
      source: 'stripe',
      statusCode: error.status,
      details: error.error,
    };
  }

  if (source === 'internal') {
    return {
      code: error.error?.code ?? `http_${error.status}`,
      message: error.error?.message ?? error.message,
      source: 'internal',
      statusCode: error.status,
      details: error.error,
    };
  }

  return {
    code: `http_${error.status}`,
    message: error.message,
    source,
    statusCode: error.status,
  };
}

function detectSource(url: string, urls: Record<string, string>): AppError['source'] {
  if (url.startsWith(urls.stripe)) return 'stripe';
  if (url.startsWith(urls.analytics)) return 'analytics';
  if (url.startsWith(urls.crm)) return 'crm';
  if (url.startsWith(urls.internal)) return 'internal';
  return 'unknown';
}
```

```typescript
// core/http/error.interceptor.ts
import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/ui/toast/toast.service';
import { Logger } from '@core/logging/logger.service';
import { mapHttpError } from './error.mapper';
import { API_BASE_URL, STRIPE_API_URL, ANALYTICS_API_URL, CRM_API_URL } from '@core/config/environment.tokens';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const logger = inject(Logger);
  const urls = {
    internal: inject(API_BASE_URL),
    stripe: inject(STRIPE_API_URL),
    analytics: inject(ANALYTICS_API_URL),
    crm: inject(CRM_API_URL),
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError = mapHttpError(error, urls);
      logger.error('HTTP error', appError);

      // No mostrar toast en errores 401 (los maneja el auth)
      if (appError.statusCode !== 401) {
        toast.show({ type: 'error', message: appError.message });
      }

      return throwError(() => appError);
    }),
  );
};
```

## Retry con backoff exponencial

Útil para APIs flaky o rate-limited.

```typescript
// core/http/retry.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

const RETRYABLE_STATUS = [408, 429, 500, 502, 503, 504];
const MAX_RETRIES = 3;

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo retry para GETs idempotentes
  if (req.method !== 'GET') return next(req);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        if (!RETRYABLE_STATUS.includes(error.status)) {
          throw error;   // no es retryable, propaga
        }
        const delayMs = Math.pow(2, retryCount) * 500 + Math.random() * 200;
        return timer(delayMs);
      },
    }),
  );
};
```

## Cache simple por URL (opcional)

Si la misma data se pide varias veces en poco tiempo:

```typescript
// core/http/cache.interceptor.ts
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, { response: HttpResponse<unknown>; expiresAt: number }>();
const TTL_MS = 60_000;

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);
  if (req.headers.has('x-no-cache')) return next(req);

  const cached = cache.get(req.urlWithParams);
  if (cached && cached.expiresAt > Date.now()) {
    return of(cached.response.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, {
          response: event.clone(),
          expiresAt: Date.now() + TTL_MS,
        });
      }
    }),
  );
};
```

Para cache serio considera `@tanstack/angular-query`.

## Reglas

- Una API = un cliente = un archivo `.client.ts`.
- Cada API tiene SU `InjectionToken` de URL y de claves.
- Auth por API se maneja con interceptor que filtra por URL.
- Errores se unifican a `AppError` antes de salir del interceptor.
- Los stores y features NUNCA conocen el formato de error de Stripe/CRM/etc; solo `AppError`.
- Si una integración es solo de una feature, vive dentro de esa feature, no en `core/integrations/`.
