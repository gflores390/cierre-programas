---
name: estructura-proyecto-tailadmin
description: Usa esta skill SIEMPRE que se trabaje en este proyecto Angular 21 basado en la plantilla TailAdmin. Define cómo convive la plantilla (shared/, layouts/, pages/) con la arquitectura enterprise por features (features/, core/), cómo migrar páginas demo a features reales, dónde poner login/auth, reglas de dependencias, naming, path aliases, y el flujo paso a paso para añadir una feature nueva. Disparadores: "crear login", "nueva feature", "dónde pongo X", "limpiar la plantilla", "estructura del proyecto", "auth", "guard", "interceptor", "refactorizar página demo", "AppLayout", "AuthPageLayout", "TailAdmin".
---

# Estructura del Proyecto — TailAdmin + Arquitectura Enterprise

Guía operativa para este proyecto Angular 21 que parte de la plantilla **TailAdmin Angular (free)** y se transforma progresivamente en una app enterprise con arquitectura por features.

> **Stack real del proyecto**: Angular 21.2.x, TypeScript 5.9, Tailwind CSS v4, standalone components (default en Angular 21), `strictTemplates: true`, RxJS 7.8, signals.

---

## 1. Filosofía: la plantilla NO se borra

TailAdmin trae cientos de horas de UI/UX. Tirarla a la basura para "empezar limpio" es una pérdida que casi ningún equipo serio asume. La forma profesional de trabajar con una plantilla admin es:

1. **Tratarla como una librería interna de UI**, no como tu aplicación.
2. **Conservar** `shared/components/ui/*`, `shared/components/form/*`, `shared/components/common/*`, `shared/layout/*` — son tu **design system gratis**.
3. **Borrar progresivamente** páginas demo (`pages/*`) **solo cuando** las reemplazas por una feature real.
4. **Construir en paralelo** la capa de negocio en `features/` + `core/` siguiendo arquitectura enterprise.
5. **Reutilizar** los layouts (`AppLayoutComponent`, `AuthPageLayoutComponent`) y los componentes presentacionales (`SigninFormComponent`, `InputComponent`, etc.); cablearlos a tus stores y servicios reales.

**Regla mental**: la plantilla aporta "cómo se ve". Tú aportas "qué hace y de dónde vienen los datos".

---

## 2. Estado actual del proyecto (snapshot)

```
src/app/
├── app.component.ts
├── app.config.ts                        # providers globales (HOY: minimal)
├── app.routes.ts                        # routing (HOY: todo eager, sin lazy)
├── pages/                               # ⚠️ DEMOS de la plantilla — migrar a features/
│   ├── auth-pages/
│   │   ├── sign-in/                     # → moverá a features/auth/feature/login-page
│   │   └── sign-up/                     # → moverá a features/auth/feature/register-page
│   ├── dashboard/ecommerce/
│   ├── profile/, calender/, charts/, forms/, invoices/
│   ├── other-page/not-found/
│   ├── tables/, ui-elements/, blank/
└── shared/                              # ✅ MANTENER — es el design system
    ├── components/
    │   ├── auth/{signin-form, signup-form}/    # UI de auth (presentacional)
    │   ├── ui/{alert, avatar, badge, button, dropdown, images, modal, table, videos}/
    │   ├── form/{input, label, select, date-picker, time-picker, multi-select, ...}/
    │   ├── common/{component-card, page-breadcrumb, theme-toggle, ...}/
    │   ├── cards/, charts/, ecommerce/, header/, invoice/, tables/, transactions/,
    │   ├── user-profile/, ui-example/
    ├── layout/
    │   ├── app-layout/                  # Shell con sidebar+header (rutas privadas)
    │   ├── app-header/, app-sidebar/, backdrop/
    │   ├── auth-page-layout/            # Shell para login/register
    │   └── generator-layout/
    ├── services/
    │   ├── modal.service.ts             # ya hay un ModalService → reutilizar
    │   ├── sidebar.service.ts
    │   └── theme.service.ts
    └── pipe/safe-html.pipe.ts
```

**Lo que falta** y vamos a añadir: `core/`, `features/`, path aliases, interceptores, guards, stores de dominio.

---

## 3. Estructura objetivo (a la que migramos progresivamente)

```
src/app/
├── core/                                # 🆕 Singletons globales — se carga 1 vez
│   ├── auth/
│   │   ├── auth.service.ts              # login, logout, refresh, token storage
│   │   ├── auth.store.ts                # signal store de sesión (user, isAuth)
│   │   ├── auth.guard.ts                # CanActivate/CanMatch funcional
│   │   ├── auth.interceptor.ts          # añade Bearer a NUESTRA API
│   │   └── auth.types.ts                # Session, AuthUser, AuthTokens
│   ├── http/
│   │   ├── error.interceptor.ts         # mapea HttpErrorResponse → AppError
│   │   ├── retry.interceptor.ts         # backoff exponencial para GETs
│   │   └── error.mapper.ts
│   ├── config/
│   │   └── environment.tokens.ts        # InjectionToken<API_BASE_URL>, etc.
│   ├── logging/
│   │   └── logger.service.ts
│   └── providers/
│       └── core.providers.ts            # provideCore() exportable
├── features/                            # 🆕 Una carpeta por dominio. Lazy loaded.
│   └── auth/                            # primera feature: login
│       ├── data-access/
│       │   ├── auth.api.ts              # POST /auth/login, /refresh, /me
│       │   └── auth.mapper.ts           # SessionDto ↔ Session
│       ├── domain/
│       │   ├── auth-user.model.ts
│       │   ├── auth.dto.ts
│       │   └── login-input.model.ts
│       ├── feature/
│       │   ├── login-page/login-page.component.ts        # SMART — usa AuthStore
│       │   └── register-page/register-page.component.ts
│       └── auth.routes.ts
├── shared/                              # ✅ INTACTO — design system del template
│   └── (igual que hoy)
├── pages/                               # ⚠️ TRANSITORIO — se vacía a medida que migramos
│   └── (las demos que aún no hemos reemplazado)
├── app.component.ts
├── app.config.ts                        # provideCore() + provideRouter + interceptors
└── app.routes.ts                        # rutas top-level con loadChildren
```

---

## 4. Reglas de dependencias (no negociables)

1. **`features/` no se importa entre sí.** Si dos features comparten algo, sube a `shared/` o `core/`.
2. **`shared/` no importa de `features/` ni de `core/`.** Es la base — no conoce dominio.
3. **`core/` no importa de `features/`.** Puede importar de `shared/`.
4. **Componentes en `shared/components/`** NO inyectan stores de dominio. Reciben datos por `input()` y emiten por `output()`. (El `ModalService` y `ThemeService` actuales son la excepción — son utilidades transversales.)
5. **Smart components** (en `features/<x>/feature/`) son los únicos que orquestan stores, routing y servicios.
6. **`pages/*` está en cuarentena.** No añadas código nuevo ahí. Solo lo tocas para borrar o migrar.

Si necesitas violar una regla, primero replantea el diseño. Casi siempre es síntoma de mala separación.

---

## 5. Cómo migrar una página demo a una feature

Ejemplo: convertir `pages/auth-pages/sign-in` en `features/auth`.

**Paso 1 — Crea la feature** siguiendo el esqueleto canónico:
```
features/auth/
├── domain/
│   ├── auth-user.model.ts        # User limpio camelCase, Date, readonly
│   ├── auth.dto.ts               # lo que devuelve el backend (snake_case)
│   └── login-input.model.ts      # { email, password, remember }
├── data-access/
│   ├── auth.api.ts               # HttpClient con POST /auth/login
│   └── auth.mapper.ts            # SessionDto → Session
├── feature/
│   └── login-page/
│       └── login-page.component.ts   # SMART, inyecta AuthStore
└── auth.routes.ts
```

**Paso 2 — Crea el store en `core/auth/auth.store.ts`** (la sesión es global, no solo de la feature):
```typescript
// signal store con user, isAuthenticated, loading, error
// llama AuthApi y persiste tokens en storage seguro
```

**Paso 3 — Reutiliza el UI del template**. El `SigninFormComponent` que ya existe en `shared/components/auth/signin-form/` queda en `shared/` pero se vuelve **puramente presentacional**:
- Recibe `loading` y `error` por `input()`.
- Emite `submit` con `{ email, password, remember }` por `output()`.
- NO inyecta servicios.

**Paso 4 — La smart component cablea todo**:
```typescript
// features/auth/feature/login-page/login-page.component.ts
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthPageLayoutComponent, SigninFormComponent],
  template: `
    <app-auth-page-layout>
      <app-signin-form
        [loading]="authStore.loading()"
        [error]="authStore.error()"
        (submit)="onSubmit($event)"
      />
    </app-auth-page-layout>
  `,
})
export class LoginPageComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  onSubmit(input: LoginInput): void {
    this.authStore.login(input).subscribe((ok) => {
      if (ok) this.router.navigateByUrl('/');
    });
  }
}
```

**Paso 5 — Actualiza el routing top-level a lazy**:
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      // dashboard y demás rutas privadas...
    ],
  },
  { path: '**', component: NotFoundComponent },
];
```

**Paso 6 — Borra** `pages/auth-pages/sign-in/` y `sign-up/`. Los imports en `app.routes.ts` quedan obsoletos: límpialos.

Repite este patrón para cada página demo que reemplaces (profile, ecommerce, etc.).

---

## 6. Convenciones de código (obligatorias)

- **Standalone components siempre.** Angular 21 ya los pone por defecto.
- **Signals** (`signal`, `computed`, `effect`) para estado. RxJS solo para HTTP, eventos, debounce.
- **`inject()`** en lugar de constructor injection.
- **Control flow nuevo**: `@if`, `@for`, `@switch`, `@defer`. NUNCA `*ngIf`, `*ngFor`.
- **`input()` / `output()`** funciones, no decoradores.
- **`ChangeDetectionStrategy.OnPush`** en todo componente nuevo.
- **Lazy loading** vía `loadChildren` apuntando a `*.routes.ts` en cada feature.
- **Strict TypeScript** (ya activo): cero `any`, cero `as`, cero `@ts-ignore` sin justificación.
- **Tres capas de tipos**: DTOs (`*.dto.ts`, snake_case), Models (`*.model.ts`, camelCase, Date, readonly), opcionalmente ViewModels (`*.vm.ts`).
- **Mapper** entre DTO y Model. La UI **nunca** ve DTOs.
- **`takeUntilDestroyed()`** en cualquier `subscribe()` dentro de componentes o de stores no-singleton.

---

## 7. Naming

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Archivos | `kebab-case` | `auth.store.ts`, `login-page.component.ts` |
| Clases | `PascalCase` | `AuthStore`, `LoginPageComponent` |
| Métodos, variables, props | `camelCase` | `isAuthenticated`, `loadAll()` |
| Constantes globales | `SCREAMING_SNAKE` | `API_BASE_URL`, `AUTH_ROUTES` |
| InjectionTokens | `SCREAMING_SNAKE` | `API_BASE_URL` |
| Selector de componente | `app-<kebab>` | `app-login-page`, `app-signin-form` |

**Sufijos de archivo**: `.component.ts`, `.service.ts`, `.store.ts`, `.api.ts`, `.guard.ts`, `.interceptor.ts`, `.pipe.ts`, `.directive.ts`, `.model.ts`, `.dto.ts`, `.mapper.ts`, `.types.ts`, `.routes.ts`, `.util.ts`.

---

## 8. Path aliases (a configurar en `tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

Después, los imports dejan de ser `../../../../shared/...` y pasan a `@shared/...`.

---

## 9. Flujo estricto para crear una feature nueva

Cuando se pida "crea la feature de X":

1. **Modelo de dominio** → `features/<x>/domain/<x>.model.ts`
2. **DTO** → `features/<x>/domain/<x>.dto.ts` (según contrato API)
3. **Mapper** → `features/<x>/data-access/<x>.mapper.ts`
4. **API client** → `features/<x>/data-access/<x>.api.ts` (encapsula `HttpClient`)
5. **Store** (si la feature tiene estado) → `features/<x>/data-access/<x>.store.ts`
6. **Componentes UI puros** → `features/<x>/ui/` (solo `input()`/`output()`)
7. **Smart components** → `features/<x>/feature/` (orquestan store + router)
8. **Rutas** → `features/<x>/<x>.routes.ts`
9. **Registro lazy** en `app.routes.ts` con `loadChildren`

No saltes pasos. No empieces por el componente.

---

## 10. Anti-patrones prohibidos en este proyecto

- Componentes con más de 200 líneas → divide.
- Lógica de negocio en templates → muévela al store o a un `computed`.
- Llamadas HTTP directas desde un componente → siempre vía `*.api.ts`.
- DTOs paseados por la UI → siempre vía mapper.
- Modales duplicados → reutiliza `shared/services/modal.service.ts`.
- `subscribe()` sin `takeUntilDestroyed()` o sin async pipe → memory leak.
- `any`, `as any`, `@ts-ignore` → prohibido salvo justificación documentada.
- Importar entre features (`@features/users` desde `@features/orders`) → prohibido.
- Código de negocio nuevo en `pages/*` → todo lo nuevo va a `features/*`.
- Renombrar/reorganizar `shared/components/*` "porque sí" → rompes el design system de la plantilla y heredas conflictos en futuros updates.

---

## 11. App config — `provideCore()` y bootstrap

Patrón objetivo para `app.config.ts`:

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { API_BASE_URL } from '@core/config/environment.tokens';
import { environment } from '@env/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
    ),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  ],
};
```

---

## 12. Login — receta concreta para este proyecto

Orden de implementación recomendado (alineado con la sección 5):

1. **Crear** `src/environments/environment.ts` con `apiBaseUrl`.
2. **Crear** `core/config/environment.tokens.ts` con `API_BASE_URL`.
3. **Crear** `core/auth/auth.types.ts` (`AuthUser`, `Session`, `AuthTokens`).
4. **Crear** `features/auth/domain/auth.dto.ts` (lo que devuelve el backend).
5. **Crear** `features/auth/data-access/auth.mapper.ts`.
6. **Crear** `features/auth/data-access/auth.api.ts` (`login()`, `refresh()`, `me()`, `logout()`).
7. **Crear** `core/auth/auth.store.ts` (signals: `user`, `isAuthenticated`, `loading`, `error`; métodos: `login`, `logout`, `restoreSession`).
8. **Crear** `core/auth/auth.interceptor.ts` (añade `Bearer` solo a URLs de `API_BASE_URL`).
9. **Crear** `core/auth/auth.guard.ts` (función `authGuard: CanActivateFn`).
10. **Crear** `features/auth/feature/login-page/login-page.component.ts` reutilizando `AuthPageLayoutComponent` + `SigninFormComponent`.
11. **Crear** `features/auth/auth.routes.ts` con rutas `login`, `register`.
12. **Actualizar** `app.routes.ts` para lazy load de `@features/auth` y proteger `AppLayoutComponent` con `authGuard`.
13. **Actualizar** `app.config.ts` con `provideHttpClient` + interceptors + `API_BASE_URL`.
14. **Borrar** `pages/auth-pages/sign-in` y `pages/auth-pages/sign-up`. Limpiar imports en `app.routes.ts`.
15. **Probar** flujo: navegar a `/auth/login`, login válido → redirige a `/`. Login inválido → error visible. Reload → sesión persiste.

**Decisiones pendientes antes de empezar** (preguntar al user):
- ¿Backend real o mock? ¿URL?
- ¿JWT (access + refresh) o sesión cookie?
- ¿"Recordarme" → localStorage; sino → sessionStorage?

---

## 13. Plan de limpieza de la plantilla (orden sugerido)

A medida que tengas features reales, borra en este orden:

1. `pages/auth-pages/*` → reemplazado por `features/auth/`.
2. `pages/dashboard/ecommerce/` → cuando exista tu dashboard real (`features/dashboard/`).
3. `pages/profile/` → cuando exista `features/profile/`.
4. `pages/forms/`, `pages/tables/`, `pages/charts/`, `pages/ui-elements/`, `pages/calender/`, `pages/invoices/` → son **demos de la plantilla**. Bórralas en bloque cuando ya hayas copiado el markup que te servía a tus features.
5. `pages/blank/` y `pages/other-page/not-found/` → la 404 se queda (o se mueve a `shared/feature/not-found/`).

**No borres**:
- `shared/components/*` (design system)
- `shared/layout/*` (shells)
- `shared/services/{modal,sidebar,theme}.service.ts` (utilidades transversales)
- `shared/pipe/safe-html.pipe.ts`

---

## 14. Referencias detalladas

Para profundizar en cada tema, consulta los archivos ya existentes en `references/`:

- `references/folder-structure.md` — Detalle exhaustivo de qué va en `core/`, `shared/`, `features/`, `layouts/`.
- `references/typing-conventions.md` — Tres capas DTO/Model/VM, type guards, genéricos, utility types, strict config.
- `references/state-management.md` — Signal store custom, NgRx Signal Store, effects, event bus, comunicación entre features.
- `references/multi-api-strategy.md` — Interceptors condicionales por URL, `AppError` unificado, retry/cache.
- `references/templates/new-feature-templates.md` — Plantillas copy-paste para domain, dto, mapper, api, store, smart, dumb, routes.

---

## 15. Resumen ejecutivo

1. **La plantilla TailAdmin se queda**. Es tu design system.
2. **`shared/` y `shared/layout/` no se tocan** salvo para mantener.
3. **`pages/` está en cuarentena**: nada nuevo, solo se borra al migrar.
4. **Todo código nuevo de negocio vive en `features/<dominio>/`** siguiendo el esqueleto canónico (`domain`, `data-access`, `feature`, `ui`).
5. **Singletons globales en `core/`** (auth, http, config, logging).
6. **Lazy loading siempre.** Path aliases siempre. Signals siempre. Standalone siempre.
7. **El login** es la primera feature real y abre el camino: define `core/auth/`, `features/auth/`, interceptor, guard, store, y se conecta al `SigninFormComponent` existente como UI presentacional.
