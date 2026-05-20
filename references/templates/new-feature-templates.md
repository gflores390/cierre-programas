# Plantillas para Nueva Feature

Reemplaza `<feature>`, `<Feature>`, `<FEATURE>` con el nombre apropiado:
- `<feature>` → kebab-case singular (ej: `user`, `product`, `order`)
- `<features>` → kebab-case plural (ej: `users`, `products`, `orders`)
- `<Feature>` → PascalCase singular (ej: `User`)
- `<Features>` → PascalCase plural (ej: `Users`)

## 1. Domain Model — `domain/<feature>.model.ts`

```typescript
export interface <Feature> {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type <Feature>Status = 'active' | 'inactive';

export type Create<Feature>Input = Omit<<Feature>, 'id' | 'createdAt' | 'updatedAt'>;
export type Update<Feature>Input = Partial<Create<Feature>Input>;
```

## 2. DTO — `domain/<feature>.dto.ts`

```typescript
export interface <Feature>Dto {
  readonly id: string;
  readonly name: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface Create<Feature>Dto {
  readonly name: string;
}
```

## 3. Mapper — `data-access/<features>.mapper.ts`

```typescript
import { <Feature> } from '../domain/<feature>.model';
import { <Feature>Dto, Create<Feature>Dto } from '../domain/<feature>.dto';

export const <Feature>Mapper = {
  fromDto(dto: <Feature>Dto): <Feature> {
    return {
      id: dto.id,
      name: dto.name,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
    };
  },

  toCreateDto(input: { name: string }): Create<Feature>Dto {
    return { name: input.name };
  },
};
```

## 4. API Client — `data-access/<features>.api.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/environment.tokens';
import { <Feature>Dto, Create<Feature>Dto } from '../domain/<feature>.dto';

@Injectable({ providedIn: 'root' })
export class <Features>Api {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_BASE_URL)}/<features>`;

  getAll(): Observable<<Feature>Dto[]> {
    return this.http.get<<Feature>Dto[]>(this.baseUrl);
  }

  getById(id: string): Observable<<Feature>Dto> {
    return this.http.get<<Feature>Dto>(`${this.baseUrl}/${id}`);
  }

  create(dto: Create<Feature>Dto): Observable<<Feature>Dto> {
    return this.http.post<<Feature>Dto>(this.baseUrl, dto);
  }

  update(id: string, dto: Partial<Create<Feature>Dto>): Observable<<Feature>Dto> {
    return this.http.patch<<Feature>Dto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

## 5. Store — `data-access/<features>.store.ts`

```typescript
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { <Features>Api } from './<features>.api';
import { <Feature>Mapper } from './<features>.mapper';
import { <Feature>, Create<Feature>Input } from '../domain/<feature>.model';

type <Features>State = {
  items: <Feature>[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

const INITIAL: <Features>State = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class <Features>Store {
  private readonly api = inject(<Features>Api);
  private readonly _state = signal<<Features>State>(INITIAL);

  readonly items = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly selected = computed(() => {
    const id = this._state().selectedId;
    return id ? this.items().find((x) => x.id === id) ?? null : null;
  });

  loadAll(): void {
    this.patch({ loading: true, error: null });
    this.api.getAll()
      .pipe(
        tap((dtos) => this.patch({ items: dtos.map(<Feature>Mapper.fromDto) })),
        catchError((err: Error) => {
          this.patch({ error: err.message });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false })),
      )
      .subscribe();
  }

  create(input: Create<Feature>Input): void {
    this.patch({ loading: true, error: null });
    this.api.create(<Feature>Mapper.toCreateDto(input))
      .pipe(
        tap((dto) => {
          const item = <Feature>Mapper.fromDto(dto);
          this.patch({ items: [...this.items(), item] });
        }),
        catchError((err: Error) => {
          this.patch({ error: err.message });
          return EMPTY;
        }),
        finalize(() => this.patch({ loading: false })),
      )
      .subscribe();
  }

  delete(id: string): void {
    this.api.delete(id)
      .pipe(
        tap(() => {
          this.patch({ items: this.items().filter((x) => x.id !== id) });
        }),
        catchError((err: Error) => {
          this.patch({ error: err.message });
          return EMPTY;
        }),
      )
      .subscribe();
  }

  select(id: string | null): void {
    this.patch({ selectedId: id });
  }

  private patch(partial: Partial<<Features>State>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
```

## 6. Smart Component (Lista) — `feature/<feature>-list/<feature>-list.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { <Features>Store } from '../../data-access/<features>.store';
import { <Feature>CardComponent } from '../../ui/<feature>-card/<feature>-card.component';
import { SpinnerComponent } from '@shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-<feature>-list',
  standalone: true,
  imports: [RouterLink, <Feature>CardComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <h1><Features></h1>
      <a routerLink="new" class="btn-primary">Crear</a>
    </header>

    @if (store.loading()) {
      <app-spinner />
    } @else if (store.error(); as error) {
      <p class="error">{{ error }}</p>
    } @else {
      <div class="grid">
        @for (item of store.items(); track item.id) {
          <app-<feature>-card
            [<feature>]="item"
            (delete)="store.delete(item.id)"
          />
        } @empty {
          <p>No hay <features>.</p>
        }
      </div>
    }
  `,
})
export class <Feature>ListComponent {
  protected readonly store = inject(<Features>Store);

  constructor() {
    this.store.loadAll();
  }
}
```

## 7. Dumb Component — `ui/<feature>-card/<feature>-card.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { <Feature> } from '../../domain/<feature>.model';

@Component({
  selector: 'app-<feature>-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      <h3>{{ <feature>().name }}</h3>
      <p>Creado: {{ <feature>().createdAt | date }}</p>
      <button (click)="delete.emit()">Eliminar</button>
    </article>
  `,
})
export class <Feature>CardComponent {
  readonly <feature> = input.required<<Feature>>();
  readonly delete = output<void>();
}
```

## 8. Routes — `<features>.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';

export const <FEATURES>_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./feature/<feature>-list/<feature>-list.component')
            .then((m) => m.<Feature>ListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./feature/<feature>-create/<feature>-create.component')
            .then((m) => m.<Feature>CreateComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./feature/<feature>-detail/<feature>-detail.component')
            .then((m) => m.<Feature>DetailComponent),
      },
    ],
  },
];
```

## 9. Registro en `app.routes.ts`

```typescript
{
  path: '<features>',
  loadChildren: () =>
    import('@features/<features>/<features>.routes')
      .then((m) => m.<FEATURES>_ROUTES),
},
```

## Checklist al crear una nueva feature

- [ ] Modelo de dominio definido en `domain/`
- [ ] DTO definido en `domain/`
- [ ] Mapper bidireccional en `data-access/`
- [ ] API client con métodos CRUD en `data-access/`
- [ ] Store con state, selectors y actions en `data-access/`
- [ ] Componentes smart en `feature/` (list, detail, create, edit)
- [ ] Componentes dumb en `ui/` (card, form, etc.)
- [ ] Rutas lazy en `<features>.routes.ts`
- [ ] Registrada en `app.routes.ts` con `loadChildren`
- [ ] Sin imports de otras features
- [ ] Sin `any` ni `as` ni `@ts-ignore`
- [ ] ChangeDetection.OnPush en todos los componentes
- [ ] `input()` y `output()` (no decoradores)
- [ ] Control flow nuevo (`@if`, `@for`)
