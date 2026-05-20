# State Management con Signals

## Cuándo usar qué

| Escenario | Solución |
|-----------|----------|
| Estado local de un componente | `signal()` dentro del componente |
| Estado compartido entre componentes de UNA feature | Servicio con signals (`feature.store.ts`) |
| Estado global (sesión, tema, notificaciones) | Servicio singleton en `core/` |
| Feature compleja con muchas entidades, side effects, etc. | `@ngrx/signals` SignalStore |
| Cache de servidor (queries, mutations) | `@tanstack/angular-query` (opcional) |

## Patrón 1: Signal Store custom (recomendado para features típicas)

Sin dependencias externas. Funciona perfecto para 80% de los casos.

```typescript
// features/products/data-access/products.store.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { ProductsApi } from './products.api';
import { ProductMapper } from './products.mapper';
import { Product, ProductFilters } from '../domain/product.model';

type ProductsState = {
  items: Product[];
  selectedId: string | null;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: ProductsState = {
  items: [],
  selectedId: null,
  filters: { search: '', category: null, sortBy: 'name' },
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly api = inject(ProductsApi);

  // State (privado)
  private readonly _state = signal<ProductsState>(INITIAL_STATE);

  // Selectors públicos (read-only)
  readonly items = computed(() => this._state().items);
  readonly selectedId = computed(() => this._state().selectedId);
  readonly filters = computed(() => this._state().filters);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  // Computed selectors
  readonly selected = computed(() =>
    this.items().find((p) => p.id === this.selectedId()) ?? null,
  );

  readonly filteredItems = computed(() => {
    const { search, category, sortBy } = this.filters();
    let result = this.items();
    if (search) {
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category) {
      result = result.filter((p) => p.category === category);
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });
  });

  readonly itemCount = computed(() => this.filteredItems().length);

  // Actions
  loadAll(): void {
    this.patch({ loading: true, error: null });
    this.api.getAll()
      .pipe(
        tap((dtos) => {
          const items = dtos.map(ProductMapper.fromDto);
          this.patch({ items });
        }),
        catchError((err: Error) => {
          this.patch({ error: err.message });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false })),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  select(id: string | null): void {
    this.patch({ selectedId: id });
  }

  updateFilters(partial: Partial<ProductFilters>): void {
    this.patch({ filters: { ...this._state().filters, ...partial } });
  }

  reset(): void {
    this._state.set(INITIAL_STATE);
  }

  // Helper privado para updates parciales
  private patch(partial: Partial<ProductsState>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
```

Uso en componente:

```typescript
@Component({
  selector: 'app-product-list',
  standalone: true,
  template: `
    @if (store.loading()) {
      <app-spinner />
    } @else if (store.error(); as error) {
      <app-error-banner [message]="error" />
    } @else {
      <app-data-table
        [data]="store.filteredItems()"
        [columns]="columns"
        (rowClick)="store.select($event.id)"
      />
    }
  `,
})
export class ProductListComponent {
  protected readonly store = inject(ProductsStore);

  protected readonly columns: ColumnDef<Product>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'price', label: 'Precio', format: (v) => `$${v}` },
  ];

  constructor() {
    this.store.loadAll();
  }
}
```

## Patrón 2: NgRx Signal Store (para features grandes)

Para features con mucha lógica, side effects complejos, o entidades CRUD. Más estructurado, menos boilerplate manual.

```bash
npm install @ngrx/signals
```

```typescript
// features/orders/data-access/orders.store.ts
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { OrdersApi } from './orders.api';
import { OrderMapper } from './orders.mapper';
import { Order } from '../domain/order.model';

type OrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;
};

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ orders }) => ({
    totalRevenue: computed(() =>
      orders().reduce((sum, o) => sum + o.total, 0),
    ),
    pendingCount: computed(() =>
      orders().filter((o) => o.status === 'pending').length,
    ),
  })),
  withMethods((store, api = inject(OrdersApi)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.getAll().pipe(
            tapResponse({
              next: (dtos) =>
                patchState(store, {
                  orders: dtos.map(OrderMapper.fromDto),
                  loading: false,
                }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadAll();
    },
  }),
);
```

Uso:

```typescript
@Component({...})
export class OrdersListComponent {
  protected readonly store = inject(OrdersStore);
}
```

## Patrón 3: Store global en `core/`

Para estado verdaderamente global: sesión, tema, idioma, notificaciones.

```typescript
// core/auth/auth.store.ts
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { AuthUser } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly auth = inject(AuthService);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _initializing = signal(true);

  readonly user = this._user.asReadonly();
  readonly initializing = this._initializing.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly roles = computed(() => this._user()?.roles ?? []);

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  setUser(user: AuthUser | null): void {
    this._user.set(user);
  }

  setInitializing(value: boolean): void {
    this._initializing.set(value);
  }
}
```

## Effects con signals

Usa `effect()` para side effects basados en signal changes. **Pero con cuidado**: los effects pueden causar loops si modificas signals dentro.

```typescript
// Bueno: persistir filtros en localStorage
constructor() {
  effect(() => {
    const filters = this.filters();
    localStorage.setItem('product-filters', JSON.stringify(filters));
  });
}

// Bueno: re-fetch cuando cambia el id
effect(() => {
  const id = this.selectedId();
  if (id) untracked(() => this.loadDetails(id));
});
```

Usa `untracked()` para leer un signal sin que el effect dependa de él.

## Comunicación entre features

Las features NO se importan entre sí. Si dos features necesitan compartir estado:

1. **Si es estado verdaderamente global**: súbelo a un store en `core/`.
2. **Si es un evento puntual**: emite por routing (query params, state) o por un event bus en `core/`.
3. **Si es datos en cache compartidos**: considera `@tanstack/angular-query` o un cache service en `core/`.

Event bus simple:

```typescript
// core/events/event-bus.service.ts
import { Injectable, signal } from '@angular/core';

export type AppEvent =
  | { type: 'USER_LOGGED_OUT' }
  | { type: 'ORDER_CREATED'; orderId: string }
  | { type: 'PRODUCT_DELETED'; productId: string };

@Injectable({ providedIn: 'root' })
export class EventBus {
  readonly lastEvent = signal<AppEvent | null>(null);

  emit(event: AppEvent): void {
    this.lastEvent.set(event);
  }
}
```

Y en otra feature:

```typescript
constructor() {
  effect(() => {
    const event = this.eventBus.lastEvent();
    if (event?.type === 'PRODUCT_DELETED') {
      this.refreshList();
    }
  });
}
```

## Reglas

- El estado privado del store es `signal()`. Los selectors públicos son `computed()` o `.asReadonly()`.
- Los componentes NUNCA modifican el estado directamente; llaman métodos del store.
- Los `effect()` solo en constructores (donde hay injection context) o con `injector` explícito.
- Suscripciones RxJS dentro del store: `takeUntilDestroyed()` cuando el store NO es singleton, no necesario cuando es `providedIn: 'root'` y vive toda la app.
- Nunca expongas el `signal` mutable; expón solo `computed` o `.asReadonly()`.
