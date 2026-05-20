# Convenciones de Tipado

## Tres capas de tipos

### 1. DTOs (`*.dto.ts`)

Reflejan EXACTAMENTE lo que devuelve el backend, incluyendo snake_case feo, campos opcionales, fechas como strings, etc.

```typescript
// features/users/domain/user.dto.ts
export interface UserDto {
  readonly id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly status: 'active' | 'inactive' | 'pending';
  readonly created_at: string;     // ISO date string
  readonly updated_at: string;
  readonly role_ids: readonly number[];
  readonly metadata?: Record<string, unknown>;
}

export interface CreateUserDto {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
  readonly password: string;
}

export interface UserListResponseDto {
  readonly data: readonly UserDto[];
  readonly meta: {
    readonly total: number;
    readonly page: number;
    readonly per_page: number;
  };
}
```

### 2. Models (`*.model.ts`)

Tu dominio limpio. CamelCase. Fechas como `Date`. Lo que viaja por toda la app.

```typescript
// features/users/domain/user.model.ts
import { UserRole } from './user-role.enum';

export interface User {
  readonly id: string;
  readonly fullName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly roles: readonly UserRole[];
  readonly metadata: Record<string, unknown>;
}

export type UserStatus = 'active' | 'inactive' | 'pending';

export type CreateUserInput = Pick<User, 'firstName' | 'lastName' | 'email'> & {
  readonly password: string;
};

export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>;
```

### 3. ViewModels (`*.vm.ts`) — opcional

Solo si un componente necesita una vista derivada distinta del modelo. Ejemplo: una tabla que muestra el modelo con campos calculados.

```typescript
// features/users/feature/user-list/user-list.vm.ts
import { User } from '../../domain/user.model';

export interface UserListItemVm {
  readonly id: string;
  readonly displayName: string;
  readonly emailMasked: string;
  readonly statusBadge: 'success' | 'warning' | 'neutral';
  readonly memberSince: string;     // formateado para UI
  readonly canEdit: boolean;        // computado según permisos
}

export function toUserListItemVm(user: User, canEdit: boolean): UserListItemVm {
  return {
    id: user.id,
    displayName: user.fullName,
    emailMasked: maskEmail(user.email),
    statusBadge: user.status === 'active' ? 'success' : 'warning',
    memberSince: formatRelativeDate(user.createdAt),
    canEdit,
  };
}
```

## Interface vs Type

- **`interface`** para objetos públicos, modelos, DTOs, contratos.
- **`type`** para uniones, intersecciones, utilidades, tipos derivados.
- **NUNCA** mezcles ambos arbitrariamente. Sigue la regla.

```typescript
// ✅ Bien
interface User { id: string; name: string; }
type UserStatus = 'active' | 'inactive';
type UserKey = keyof User;
type PartialUser = Partial<User>;

// ❌ Mal
type User = { id: string; name: string; }   // usa interface
interface UserStatus { ... }                  // usa type para uniones
```

## Type guards en lugar de `as`

```typescript
// ❌ NUNCA
const user = data as User;

// ✅ SIEMPRE
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as Record<string, unknown>)['id'] === 'string' &&
    'email' in value &&
    typeof (value as Record<string, unknown>)['email'] === 'string'
  );
}

// Uso
if (isUser(data)) {
  // data es User aquí, sin casting
  console.log(data.email);
}
```

Type guards genéricos para reusar:

```typescript
// shared/utils/type-guards.ts
export function isString(v: unknown): v is string {
  return typeof v === 'string';
}

export function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K,
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function isNonNullable<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}
```

## Enum vs union literal

Prefiere unión literal + `as const` salvo que necesites iterar.

```typescript
// ✅ Preferido
export const USER_STATUSES = ['active', 'inactive', 'pending'] as const;
export type UserStatus = typeof USER_STATUSES[number];

// Iterar
for (const status of USER_STATUSES) { /* ... */ }

// ⚠️ Solo si necesitas enum (interop con backend numérico)
export enum UserRole {
  Admin = 1,
  Editor = 2,
  Viewer = 3,
}
```

Evita `enum` de strings; las uniones literales son más ligeras y type-safe.

## Genéricos para servicios reutilizables

```typescript
// shared/types/api-response.type.ts
export interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: ApiMeta;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

export interface ApiMeta {
  readonly requestId: string;
  readonly timestamp: string;
}

// Uso
function fetchUsers(): Observable<Paginated<User>> { ... }
```

Base API client genérico (opcional):

```typescript
// core/http/base-api.client.ts
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class BaseApiClient {
  protected readonly http = inject(HttpClient);
  protected abstract readonly baseUrl: string;

  protected get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    const httpParams = params
      ? new HttpParams({ fromObject: params as Record<string, string> })
      : undefined;
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  protected post<TBody, TResp>(path: string, body: TBody): Observable<TResp> {
    return this.http.post<TResp>(`${this.baseUrl}${path}`, body);
  }

  protected put<TBody, TResp>(path: string, body: TBody): Observable<TResp> {
    return this.http.put<TResp>(`${this.baseUrl}${path}`, body);
  }

  protected delete<T = void>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
```

Y luego:

```typescript
@Injectable({ providedIn: 'root' })
export class UsersApi extends BaseApiClient {
  protected readonly baseUrl = `${inject(API_BASE_URL)}/users`;

  getAll(params?: PaginationParams): Observable<Paginated<UserDto>> {
    return this.get<Paginated<UserDto>>('', params);
  }

  create(dto: CreateUserDto): Observable<UserDto> {
    return this.post<CreateUserDto, UserDto>('', dto);
  }
}
```

## Utility types útiles

```typescript
// shared/types/utility.types.ts
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type NonEmptyArray<T> = readonly [T, ...T[]];
```

## Strict TypeScript Config

`tsconfig.json` mínimo recomendado:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  }
}
```

`noUncheckedIndexedAccess: true` te obliga a chequear si `array[0]` existe; previene muchos null bugs.

`strictTemplates: true` hace que el template chequee tipos como TS.

## Reglas finales

- `any` está prohibido. Si te ves usándolo, replantea.
- `as` está prohibido salvo para `as const`. Usa type guards.
- `// @ts-ignore` y `// @ts-expect-error` están prohibidos sin un comentario explicando POR QUÉ.
- Todas las props públicas de modelos: `readonly`.
- Arrays inmutables: `readonly T[]`.
- Funciones puras tipadas explícitamente en su firma de retorno cuando sean exportadas.
