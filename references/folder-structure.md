# Estructura de Carpetas Detallada

## `src/app/core/`

Singletons globales. Se cargan **una sola vez** al arrancar la app. Nunca se inyectan en features lazy con `providers: []`.

```
core/
├── auth/
│   ├── auth.service.ts           # Login, logout, refresh token, sesión actual
│   ├── auth.store.ts             # Estado de sesión (user actual, roles, permisos)
│   ├── auth.guard.ts             # CanActivate / CanMatch funcional
│   ├── auth.interceptor.ts       # Añade Authorization header
│   └── auth.types.ts             # Session, AuthUser, AuthTokens
├── http/
│   ├── base-api.client.ts        # Cliente HTTP abstracto base (opcional)
│   ├── error.interceptor.ts      # Captura errores HTTP globales
│   ├── retry.interceptor.ts      # Retry con backoff exponencial
│   ├── loading.interceptor.ts    # Marca loading global si hace falta
│   └── http.types.ts             # ApiError, HttpContext tokens
├── config/
│   ├── app.config.ts             # Configuración de runtime
│   ├── environment.tokens.ts     # InjectionTokens de URLs y claves
│   └── feature-flags.service.ts  # Si manejas flags
├── i18n/                         # Si tienes internacionalización
│   ├── translation.loader.ts
│   └── i18n.config.ts
├── logging/
│   ├── logger.service.ts         # Wrapper sobre console + servicio remoto
│   └── error-tracker.service.ts  # Sentry, Datadog, etc.
└── providers/
    └── core.providers.ts         # Función provideCore() que exporta todos los providers
```

Patrón recomendado para `core.providers.ts`:

```typescript
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth.interceptor';
import { errorInterceptor } from './http/error.interceptor';

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
    // otros providers globales
  ]);
}
```

Luego en `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideCore(),
    provideAnimationsAsync(),
  ],
};
```

## `src/app/shared/`

Reutilizable y SIN lógica de negocio. Si algo aquí necesita conocer qué es un `User` o un `Order`, está mal ubicado.

```
shared/
├── ui/                           # Componentes presentacionales reutilizables
│   ├── button/
│   │   ├── button.component.ts
│   │   └── button.types.ts
│   ├── input/
│   ├── select/
│   ├── modal/
│   │   ├── modal.component.ts
│   │   ├── modal-host.directive.ts
│   │   ├── modal.service.ts
│   │   └── modal.types.ts
│   ├── data-table/
│   │   ├── data-table.component.ts
│   │   ├── data-table.types.ts   # ColumnDef<T>, SortDirection, etc.
│   │   └── cell-template.directive.ts
│   ├── form-field/
│   ├── card/
│   ├── badge/
│   ├── tabs/
│   ├── toast/
│   │   └── toast.service.ts
│   └── index.ts                  # Barrel: export * from './button/...'
├── directives/
│   ├── click-outside.directive.ts
│   ├── autofocus.directive.ts
│   └── permission.directive.ts   # *appHasPermission="'users.edit'"
├── pipes/
│   ├── safe-html.pipe.ts
│   ├── time-ago.pipe.ts
│   └── currency-format.pipe.ts
├── utils/
│   ├── date.util.ts
│   ├── string.util.ts
│   ├── object.util.ts
│   ├── array.util.ts
│   └── type-guards.ts            # isString, isObject, hasProperty, etc.
├── validators/                   # Validators de formularios reutilizables
│   ├── email.validator.ts
│   ├── password.validator.ts
│   └── match.validator.ts
└── types/
    ├── api-response.type.ts      # ApiResponse<T>, Paginated<T>
    ├── pagination.type.ts        # PaginationParams, PaginationMeta
    ├── result.type.ts            # Result<T, E>
    ├── nullable.type.ts          # Nullable<T>, Maybe<T>
    └── deep-readonly.type.ts     # Utility types
```

Reglas para `shared/`:
- Cero imports de `core/` o `features/`.
- Componentes UI: solo `input()`/`output()`. No inyectan stores ni servicios de dominio.
- Sí pueden inyectar otros componentes UI o utilidades (`Logger`, `ToastService`).
- Cada subcarpeta exporta un barrel `index.ts`.

## `src/app/features/`

Una carpeta por dominio de negocio. Cada feature es **autónoma** y se carga lazy.

```
features/
├── users/
│   ├── data-access/
│   │   ├── users.api.ts
│   │   ├── users.store.ts
│   │   ├── users.mapper.ts
│   │   └── index.ts
│   ├── domain/
│   │   ├── user.model.ts
│   │   ├── user.dto.ts
│   │   ├── user.rules.ts         # Validaciones de dominio puras
│   │   └── user-role.enum.ts
│   ├── feature/                  # Smart components = páginas/rutas
│   │   ├── user-list/
│   │   │   ├── user-list.component.ts
│   │   │   ├── user-list.component.html
│   │   │   └── user-list.component.scss
│   │   ├── user-detail/
│   │   └── user-create/
│   ├── ui/                       # Dumb components específicos de la feature
│   │   ├── user-card/
│   │   ├── user-form/
│   │   └── user-avatar/
│   ├── guards/
│   │   └── can-edit-user.guard.ts
│   ├── resolvers/
│   │   └── user.resolver.ts
│   └── users.routes.ts
├── products/
├── orders/
└── dashboard/
```

### Subcarpetas explicadas

**`data-access/`** — Todo lo que habla con el mundo exterior (HTTP) y lo que mantiene estado.

**`domain/`** — Modelos puros y lógica de dominio. NO depende de Angular. Podrías mover estos archivos a un proyecto Node y seguirían funcionando.

**`feature/`** — Componentes "smart" que son routeables. Inyectan stores. Usan los componentes dumb de `ui/` y `shared/ui/`.

**`ui/`** — Componentes presentacionales solo de esta feature. Si un componente ya se usa en 2+ features, súbelo a `shared/ui/`.

### Ejemplo de `users.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./feature/user-list/user-list.component')
            .then((m) => m.UserListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./feature/user-create/user-create.component')
            .then((m) => m.UserCreateComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./feature/user-detail/user-detail.component')
            .then((m) => m.UserDetailComponent),
      },
    ],
  },
];
```

Y en `app.routes.ts`:

```typescript
export const routes: Routes = [
  {
    path: 'users',
    loadChildren: () =>
      import('@features/users/users.routes').then((m) => m.USERS_ROUTES),
  },
  // ...
];
```

## `src/app/layouts/`

Layouts visuales de página. Un layout es un componente que define la estructura (header, sidebar, footer) y tiene un `<router-outlet>` para el contenido.

```
layouts/
├── main-layout/
│   ├── main-layout.component.ts  # Header + Sidebar + outlet
│   └── components/               # Subcomponentes del layout
│       ├── header/
│       └── sidebar/
├── auth-layout/                  # Layout simple para login/register
└── admin-layout/                 # Layout específico de admin
```

Se usan en routing:

```typescript
{
  path: '',
  component: MainLayoutComponent,
  children: [
    { path: 'users', loadChildren: () => import(...) },
    { path: 'products', loadChildren: () => import(...) },
  ],
},
{
  path: 'auth',
  component: AuthLayoutComponent,
  children: [...],
}
```

## Cuándo subir algo de `feature/` a `shared/`

Subida cuando:
- 2+ features ya lo usan.
- No tiene lógica de negocio ni conoce un modelo de dominio específico.
- Es genuinamente genérico (un `<app-data-table>` que recibe `ColumnDef<T>[]`).

NO subir si:
- Solo se usa en una feature aunque "podría" reusarse algún día. YAGNI.
- Conoce el modelo `User`, `Product`, etc. → eso es lógica de dominio.

## Cuándo dividir una feature

Divide cuando:
- La carpeta `feature/` tiene más de 6-8 rutas.
- Hay sub-dominios claros (ej: `users` se divide en `users/profile`, `users/admin`, `users/permissions`).

Crea subfeatures como carpetas anidadas, NO como features hermanas:

```
features/users/
├── profile/        # subfeature
│   ├── data-access/
│   ├── domain/
│   └── feature/
├── admin/          # subfeature
└── users.routes.ts # agrega las rutas de las subfeatures
```
