---
name: angular-enterprise-architecture
description: Usa esta skill cuando el usuario trabaje en proyectos Angular (especialmente Angular 17+, 20, 21 o superior) y necesite estructura de carpetas, arquitectura de aplicación, patrones de diseño, organización de features, consumo de múltiples APIs, manejo de estado con signals, tipado estricto, reutilización de componentes (modales, formularios, tablas), o quiera evitar código espagueti. Disparadores típicos: "arquitectura Angular", "estructura de carpetas Angular", "cómo organizar mi proyecto Angular", "patrones de diseño Angular", "Angular standalone", "signals store", "consumir varias APIs Angular", "evitar duplicar modales/componentes", "tipado Angular DTO model". También aplica cuando el usuario pide crear una nueva feature, un nuevo servicio API, un nuevo store, o refactorizar código Angular existente.
---

# Angular Enterprise Architecture

Guía senior para construir sistemas Angular grandes (Angular 17+, optimizado para 20/21+) usando standalone components, signals, y arquitectura por capas con feature-based folders.

## Cuándo usar esta skill

Activa esta skill SIEMPRE que el usuario:
- Pida crear una nueva feature, módulo, servicio API o store.
- Pregunte por arquitectura, estructura de carpetas o patrones de diseño en Angular.
- Quiera consumir APIs (especialmente múltiples APIs de distintos orígenes).
- Mencione modales, componentes UI reutilizables, o evitar duplicación.
- Refactorice código Angular existente.
- Pregunte sobre tipado, DTOs, modelos, signals, NgRx Signal Store.

## Stack y convenciones obligatorias

- **Angular 17+ con standalone components.** NUNCA usar NgModules salvo que el usuario lo pida explícitamente por compatibilidad.
- **Signals** (`signal`, `computed`, `effect`) como mecanismo de estado por defecto. RxJS solo para flujos asíncronos y eventos (HTTP, WebSockets, debounce).
- **`inject()`** en lugar de inyección por constructor para servicios y tokens.
- **Control flow nuevo**: `@if`, `@for`, `@switch`, `@defer`. Nunca `*ngIf`, `*ngFor`.
- **`input()` y `output()`** funciones, no decoradores `@Input()`/`@Output()`.
- **Lazy loading siempre** para features con `loadChildren` apuntando a `*.routes.ts`.
- **Strict mode de TypeScript activado**: `strict: true`, `strictNullChecks: true`, `noImplicitAny: true`.
- **Nunca `any`.** Si no sabes el tipo, usa `unknown` y haz narrowing con type guards.

## Estructura de carpetas canónica

```
src/app/
├── core/              # Singletons globales (auth, http base, config). Se carga 1 vez.
├── shared/            # Reutilizable sin lógica de negocio (UI, utils, pipes, types base).
├── features/          # Una carpeta por dominio de negocio. Lazy loaded.
│   └── <feature>/
│       ├── data-access/   # *.api.ts, *.store.ts, *.mapper.ts
│       ├── domain/        # *.model.ts, *.dto.ts, *.rules.ts
│       ├── feature/       # Smart components (páginas)
│       ├── ui/            # Dumb components (presentacionales)
│       └── <feature>.routes.ts
├── layouts/           # Layouts de página (main, auth, admin)
├── app.component.ts
├── app.config.ts      # bootstrapApplication providers
└── app.routes.ts
```

Detalles exhaustivos de cada carpeta en `references/folder-structure.md`.

## Reglas de dependencias (no negociables)

1. **Features no se importan entre sí.** Si dos features comparten código, ese código sube a `shared/` o `core/`.
2. **`shared/` no importa de `features/` ni de `core/`.** Es la base.
3. **`core/` no importa de `features/`.** Puede importar de `shared/`.
4. **Componentes UI (en `shared/ui/` o `<feature>/ui/`) NO inyectan servicios.** Solo `input()`/`output()`.
5. **Componentes feature (smart) son los únicos que orquestan stores, routing y servicios.**

Si necesitas violar una regla, primero replantea el diseño. Es casi siempre un síntoma de mala separación.

## Patrones obligatorios

### 1. Repository / API client por feature

Cada feature tiene un archivo `<feature>.api.ts` que encapsula TODAS las llamadas HTTP. Los componentes nunca tocan `HttpClient` directamente.

```typescript
// features/users/data-access/users.api.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../domain/user.dto';
import { API_BASE_URL } from '@core/config/environment.tokens';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.baseUrl}/users`);
  }

  getById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/users/${id}`);
  }
}
```

### 2. Mapper DTO ↔ Model

NUNCA usar DTOs en la UI. Conviértelos a modelos de dominio limpios.

```typescript
// features/users/data-access/users.mapper.ts
import { User } from '../domain/user.model';
import { UserDto } from '../domain/user.dto';

export const UserMapper = {
  fromDto(dto: UserDto): User {
    return {
      id: dto.id,
      fullName: `${dto.first_name} ${dto.last_name}`,
      email: dto.email,
      createdAt: new Date(dto.created_at),
      isActive: dto.status === 'active',
    };
  },

  toDto(model: Partial<User>): Partial<UserDto> {
    const [first_name, ...rest] = (model.fullName ?? '').split(' ');
    return {
      first_name,
      last_name: rest.join(' '),
      email: model.email,
    };
  },
};
```

### 3. Signal Store por feature

Estado encapsulado con signals. Sin librerías externas para features simples; usar `@ngrx/signals` para features grandes.

```typescript
// features/users/data-access/users.store.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, tap } from 'rxjs';
import { UsersApi } from './users.api';
import { UserMapper } from './users.mapper';
import { User } from '../domain/user.model';

type UsersState = {
  users: User[];
  loading: boolean;
  error: string | null;
};

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly api = inject(UsersApi);

  private readonly _state = signal<UsersState>({
    users: [],
    loading: false,
    error: null,
  });

  readonly users = computed(() => this._state().users);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly userCount = computed(() => this._state().users.length);

  loadAll(): void {
    this._state.update((s) => ({ ...s, loading: true, error: null }));
    this.api.getAll()
      .pipe(
        tap((dtos) => {
          const users = dtos.map(UserMapper.fromDto);
          this._state.update((s) => ({ ...s, users, loading: false }));
        }),
        catchError((err) => {
          this._state.update((s) => ({
            ...s,
            loading: false,
            error: err.message ?? 'Error loading users',
          }));
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
```

### 4. Multi-API con Strategy + InjectionToken

Cuando consumes varias APIs de distintos orígenes (Stripe, tu backend, API externa), define clientes separados.

```typescript
// core/config/environment.tokens.ts
import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
export const STRIPE_API_URL = new InjectionToken<string>('STRIPE_API_URL');
export const ANALYTICS_API_URL = new InjectionToken<string>('ANALYTICS_API_URL');

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    { provide: STRIPE_API_URL, useValue: environment.stripeUrl },
    { provide: ANALYTICS_API_URL, useValue: environment.analyticsUrl },
    // ...
  ],
};
```

Cada cliente API inyecta el token correspondiente. Si hay autenticación distinta por API, usa interceptors con condicional sobre la URL o crea instancias separadas de `HttpClient` con `withInterceptorsFromDi()` configurado por contexto.

### 5. Modal Service centralizado (UN solo modal en toda la app)

Nunca dupliques componentes modal. Crea UN `ModalService` que abre cualquier componente como contenido.

```typescript
// shared/ui/modal/modal.service.ts
import { ComponentRef, inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalComponent } from './modal.component';

export interface ModalRef<R = unknown> {
  close: (result?: R) => void;
  afterClosed: () => Promise<R | undefined>;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private rootVcr?: ViewContainerRef;

  register(vcr: ViewContainerRef): void {
    this.rootVcr = vcr;
  }

  open<T, D = unknown, R = unknown>(
    content: Type<T>,
    data?: D,
  ): ModalRef<R> {
    if (!this.rootVcr) throw new Error('ModalService not registered');

    const closed$ = new Subject<R | undefined>();
    const modalRef = this.rootVcr.createComponent(ModalComponent);

    const contentRef = modalRef.instance.contentVcr.createComponent(content);
    if (data && 'data' in (contentRef.instance as object)) {
      (contentRef.instance as { data: D }).data = data;
    }

    const close = (result?: R) => {
      modalRef.destroy();
      closed$.next(result);
      closed$.complete();
    };

    modalRef.instance.dismiss.subscribe(() => close());

    return {
      close,
      afterClosed: () => new Promise((resolve) => closed$.subscribe(resolve)),
    };
  }
}
```

Uso desde un componente:
```typescript
const ref = this.modal.open(ConfirmDeleteComponent, { userId: '123' });
const confirmed = await ref.afterClosed();
if (confirmed) this.usersStore.delete('123');
```

### 6. Result type para manejo de errores

```typescript
// shared/types/result.type.ts
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

## Convenciones de tipado

Tres capas:
- **DTOs** (`*.dto.ts`): exactamente lo que devuelve la API. Sufijo `Dto`. Reflejan snake_case si el backend lo usa.
- **Models** (`*.model.ts`): tu dominio limpio en camelCase. Sin sufijo. Esto es lo que viaja por la app.
- **ViewModels** (opcional, `*.vm.ts`): si un componente necesita una vista derivada distinta al modelo, créala. Sufijo `Vm`.

Reglas:
- `interface` para contratos públicos y modelos.
- `type` para uniones, intersecciones, utilidades.
- `enum` solo si necesitas iterar valores; prefiere `as const` + union type.
- Type guards (`function isUser(x: unknown): x is User`) en lugar de `as`.
- `readonly` en propiedades inmutables (`readonly id: string`).
- Genéricos para servicios reutilizables.

Ver `references/typing-conventions.md` para detalle completo.

## Naming conventions

- Archivos: `kebab-case.ts` (`user-list.component.ts`, `users.api.ts`).
- Clases: `PascalCase`.
- Métodos, variables, propiedades: `camelCase`.
- Constantes globales: `SCREAMING_SNAKE_CASE`.
- InjectionTokens: `SCREAMING_SNAKE_CASE`.
- Selectores de componentes: `app-<kebab>` (`app-user-card`).
- Sufijos de archivo: `.component.ts`, `.service.ts`, `.store.ts`, `.api.ts`, `.guard.ts`, `.interceptor.ts`, `.pipe.ts`, `.directive.ts`, `.model.ts`, `.dto.ts`, `.mapper.ts`, `.types.ts`, `.routes.ts`, `.util.ts`.

## Path aliases (tsconfig)

Configura en `tsconfig.json` para evitar imports infernales con `../../../`:

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@layouts/*": ["src/app/layouts/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

## Flujo recomendado al crear una nueva feature

Cuando el usuario pida "crea la feature de X", sigue este orden estricto:

1. Define el modelo de dominio en `features/<x>/domain/x.model.ts`.
2. Define el DTO en `features/<x>/domain/x.dto.ts` (según el contrato de la API).
3. Crea el mapper en `features/<x>/data-access/x.mapper.ts`.
4. Crea el API client en `features/<x>/data-access/x.api.ts`.
5. Crea el store en `features/<x>/data-access/x.store.ts`.
6. Crea los componentes UI puros en `features/<x>/ui/` (sin inyectar nada).
7. Crea los smart components en `features/<x>/feature/` (consumen el store).
8. Define las rutas en `features/<x>/x.routes.ts`.
9. Registra la ruta lazy en `app.routes.ts` con `loadChildren`.

## Anti-patrones que NUNCA debes producir

- Componentes con más de 200 líneas → divide.
- Lógica de negocio en templates → muévela al store o a un computed.
- Llamadas HTTP directas desde un componente → usa el api.
- DTOs paseados por la UI → usa mapper.
- Modales duplicados → ModalService.
- `subscribe()` sin `takeUntilDestroyed()` o sin async pipe → leaks.
- `any`, `as any`, `@ts-ignore` → prohibido salvo justificación documentada.
- Servicios singleton declarados en `providers: []` de componentes (excepto intencional) → usa `providedIn: 'root'`.
- Importar de `features/<otra-feature>/` desde una feature distinta.
- Código en `app.component.ts` que no sea bootstrap del layout.

## Archivos de referencia detallada

- `references/folder-structure.md` — Detalle exhaustivo de qué va en cada carpeta.
- `references/typing-conventions.md` — Tipado avanzado, type guards, genéricos.
- `references/state-management.md` — Signal store, NgRx Signal Store, cuándo usar cada uno.
- `references/multi-api-strategy.md` — Cómo organizar múltiples APIs con interceptors condicionales.
- `references/templates/` — Archivos plantilla copiables para una nueva feature.

Consulta el archivo de referencia correspondiente cuando la tarea sea específica de ese tema.
