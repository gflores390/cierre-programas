---
name: estructura-proyecto-sistema-integrado
description: Guia operativa del proyecto Angular 21. Define la arquitectura vigente, responsabilidades por carpeta, reglas de dependencias, creacion de features, componentes, servicios, modelos, rutas y uso del design system.
---

# Arquitectura y convenciones del proyecto

> Estado revisado contra el codigo del repositorio: **9 de junio de 2026**.
>
> Este documento es la fuente de verdad para crear o ubicar archivos nuevos. Los
> archivos heredados de TailAdmin pueden no cumplir todas las reglas; no deben
> copiarse como referencia sin revisar esta guia.

## 1. Stack real

- Angular 21.2 con componentes standalone.
- TypeScript 5.9 en modo `strict`.
- Tailwind CSS v4 con tokens en `src/styles.css`.
- Signals para estado local y de feature.
- RxJS para HTTP, eventos asincronos y flujos que realmente lo requieran.
- Rutas lazy mediante `loadChildren` y `loadComponent`.
- `ChangeDetectionStrategy.OnPush` en componentes nuevos.

### Comandos del proyecto

Angular CLI esta instalado localmente. No se requiere `ng` global:

```powershell
npm install
npm start
npm run build
npm test
```

Para ejecutar Angular CLI directamente:

```powershell
npx ng version
npx ng generate component features/alumnos/ui/alumno-card
```

Si aparece `ng: The term 'ng' is not recognized`, usar `npm start` o `npx ng`,
no instalar una version global diferente a la declarada en `package.json`.

## 2. Estructura vigente

```text
src/app/
|-- app.component.ts              # host raiz: router + modal outlet
|-- app.config.ts                 # providers globales
|-- app.routes.ts                 # rutas de primer nivel
|-- core/                         # infraestructura singleton de toda la app
|   |-- components/
|   |   `-- modal-outlet/
|   |-- services/
|   |   `-- modal.service.ts
|   `-- index.ts
|-- features/                     # dominios funcionales de la aplicacion
|   |-- dashboard/
|   |   |-- data/
|   |   |-- models/
|   |   |-- feature/
|   |   `-- dashboard.routes.ts
|   `-- matriculacion/
|       |-- data/
|       |-- models/
|       |-- feature/
|       |-- ui/
|       `-- matriculacion.routes.ts
|-- shared/                       # design system e infraestructura visual
|   |-- components/
|   |-- config/
|   |-- layout/
|   |-- pipes/
|   `-- services/
|-- pages/                        # legado; actualmente solo contiene la pagina 404
`-- example-pdf-viewer/           # ejemplo aislado; no es una feature productiva
```

### Responsabilidad de cada carpeta

| Carpeta | Contenido permitido |
|---|---|
| `core/` | Servicios y componentes globales que se instancian una vez: autenticacion, interceptores, configuracion, modal global, logging. |
| `features/` | Codigo de negocio agrupado por dominio: matriculacion, dashboard, usuarios, pagos, etc. |
| `shared/` | UI reutilizable, layouts, pipes, utilidades visuales y tipos realmente genericos. No contiene reglas de un dominio. |
| `pages/` | Codigo heredado pendiente de migracion. No crear funcionalidad nueva aqui. |
| `public/` | Imagenes, iconos, fuentes y archivos estaticos servidos sin procesamiento. |

## 3. Estructura canonica de una feature

La convencion vigente del proyecto es `data/`, `models/`, `feature/` y `ui/`.
No introducir en paralelo nombres como `data-access/` o `domain/`.

```text
features/<feature>/
|-- data/
|   |-- <feature>.service.ts      # estado y casos de uso de la feature
|   |-- <feature>.api.ts          # HttpClient, cuando exista backend
|   |-- <feature>.mapper.ts       # DTO <-> modelo, cuando sea necesario
|   |-- <feature>.fixture.ts      # datos mock grandes, solo desarrollo
|   `-- index.ts
|-- models/
|   |-- <feature>.model.ts        # modelos usados por la aplicacion
|   |-- <feature>.dto.ts          # contrato exacto del backend
|   |-- <feature>.types.ts        # uniones y tipos auxiliares
|   `-- index.ts
|-- feature/
|   `-- <feature>-page/
|       |-- <feature>-page.component.ts
|       |-- <feature>-page.component.html
|       `-- <feature>-page.component.spec.ts
|-- ui/
|   |-- <componente-presentacional>/
|   |-- modals/
|   `-- index.ts
`-- <feature>.routes.ts
```

No todas las features necesitan todos los archivos:

- Sin backend: no crear `*.api.ts` ni DTOs vacios.
- Sin estado compartido: puede bastar estado local en la pagina.
- Sin UI reutilizable dentro de la feature: omitir `ui/`.
- Los fixtures pequenos pueden empezar junto al servicio, pero deben moverse a
  `*.fixture.ts` cuando dificulten leer la logica.

## 4. Reglas de dependencias

La direccion de dependencias es:

```text
app -> core
app -> features
app -> shared
features -> core
features -> shared
core -> shared
shared -> Angular y librerias genericas
```

Reglas obligatorias:

1. Una feature no importa archivos internos de otra feature.
2. `shared/` no importa desde `features/`.
3. `core/` no importa desde `features/`.
4. Los componentes no usan `HttpClient` directamente.
5. Los DTOs no llegan al template; se convierten a modelos de la aplicacion.
6. Una pagina de `feature/` coordina datos, navegacion, modales y componentes UI.
7. Un componente de `ui/` recibe datos con `input()` y comunica acciones con
   `output()`.
8. No mover codigo a `shared/` solo porque se usa dos veces dentro de una misma
   feature. Primero debe ser generico y no depender del dominio.

### Excepcion temporal: modales

Algunos componentes actuales de `features/matriculacion/ui/` inyectan
`ModalService` para abrir o cerrar modales. Para codigo nuevo:

- La pagina debe abrir el modal cuando la accion forma parte de un flujo.
- El componente UI debe emitir una accion como `verDocumento`.
- Un componente usado como contenido de modal puede inyectar `ModalService`
  solamente para cerrarse, hasta que exista una abstraccion `ModalRef`.
- Un componente UI no debe inyectar servicios de datos de la feature.

## 5. Responsabilidades por tipo de archivo

### Pagina inteligente: `feature/`

Una pagina:

- Inyecta servicios o stores.
- Expone signals y `computed()` al template.
- Coordina componentes UI.
- Abre modales y navega con `Router`.
- No contiene tablas, formularios o dialogos extensos en un solo archivo.

```typescript
@Component({
  selector: 'app-alumnos-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlumnoTableComponent],
  templateUrl: './alumnos-page.component.html',
})
export class AlumnosPageComponent {
  private readonly alumnosService = inject(AlumnosService);
  private readonly modalService = inject(ModalService);

  readonly alumnos = this.alumnosService.alumnos;
  readonly loading = this.alumnosService.loading;

  onEditar(alumno: Alumno): void {
    this.modalService.open(AlumnoFormModalComponent, { alumno });
  }
}
```

### Componente presentacional: `ui/`

Un componente UI:

- Usa `input()` y `output()`.
- Puede tener estado visual local con `signal()`.
- No conoce rutas, endpoints ni almacenamiento.
- No modifica directamente el estado de la feature.

```typescript
@Component({
  selector: 'app-alumno-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, ColumnTemplateDirective],
  templateUrl: './alumno-table.component.html',
})
export class AlumnoTableComponent {
  readonly alumnos = input.required<Alumno[]>();
  readonly editar = output<Alumno>();
  readonly eliminar = output<Alumno>();
}
```

### Capa de datos: `data/`

En features simples, un `*.service.ts` puede encapsular estado con signals:

```typescript
@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private readonly _alumnos = signal<Alumno[]>([]);
  private readonly _loading = signal(false);

  readonly alumnos = this._alumnos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = computed(() => this._alumnos().length);
}
```

Cuando se conecte un backend, separar responsabilidades:

- `*.api.ts`: solicitudes HTTP tipadas.
- `*.dto.ts`: respuesta exacta del backend.
- `*.mapper.ts`: conversion DTO/modelo.
- `*.service.ts` o `*.store.ts`: estado y casos de uso.

No mezclar en un mismo archivo grande fixtures, HTTP, mapeo, estado y
generacion de documentos.

### Modelos: `models/`

- `interface` para entidades y contratos de objetos.
- `type` para uniones, estados y composiciones.
- Propiedades `readonly` cuando no deban mutarse.
- `unknown` y type guards para datos no confiables.
- No usar `any`, `as any` ni `@ts-ignore`.
- Fechas del backend pueden llegar como string en DTO; el modelo decide si usa
  `Date` o un string normalizado.

## 6. Convenciones Angular

Todo componente nuevo debe seguir este patron:

```typescript
@Component({
  selector: 'app-ejemplo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './ejemplo.component.html',
})
export class EjemploComponent {}
```

Reglas:

- Usar `inject()` en codigo nuevo, no inyeccion por constructor.
- Usar `input()`, `input.required()` y `output()`, no decoradores
  `@Input()`/`@Output()`.
- Usar `@if`, `@for`, `@switch` y `@defer`, no `*ngIf` ni `*ngFor`.
- Signals para estado sincronico: `signal`, `computed`, `linkedSignal`.
- RxJS para HTTP y flujos asincronos.
- Usar `async` pipe, `toSignal()` o `takeUntilDestroyed()` para evitar fugas.
- No hacer `subscribe()` anidados.
- Mantener el template declarativo; mover calculos complejos a `computed()`.
- Evitar componentes de negocio de mas de unas 200 lineas. Dividir por
  responsabilidad, no por cantidad arbitraria de HTML.

`shared/` conserva componentes heredados de TailAdmin con constructor,
`@Input()`, `@Output()` e incluso algunos `any`. Son deuda tecnica compatible
con la plantilla, no el estandar para archivos nuevos.

### Naming

| Elemento | Convencion | Ejemplo |
|---|---|---|
| Archivos y carpetas | `kebab-case` | `alumno-form-modal.component.ts` |
| Clases e interfaces | `PascalCase` | `AlumnosService`, `AlumnoDto` |
| Variables y metodos | `camelCase` | `alumnosFiltrados`, `cargarAlumnos()` |
| Constantes globales | `SCREAMING_SNAKE_CASE` | `ALUMNOS_ROUTES` |
| Selectores | `app-<kebab-case>` | `app-alumno-table` |
| Signals privados mutables | prefijo `_` | `_alumnos` |
| Signals publicos | nombre descriptivo sin `$` | `alumnos`, `loading` |
| Observables | sufijo `$` | `alumnos$` |

Sufijos habituales: `.component.ts`, `.service.ts`, `.store.ts`, `.api.ts`,
`.mapper.ts`, `.model.ts`, `.dto.ts`, `.types.ts`, `.routes.ts`,
`.guard.ts`, `.interceptor.ts`, `.pipe.ts` y `.directive.ts`.

## 7. Routing y navegacion

Cada feature publica sus propias rutas:

```typescript
import { Routes } from '@angular/router';

export const ALUMNOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/alumnos-page/alumnos-page.component').then(
        (m) => m.AlumnosPageComponent,
      ),
    title: 'Alumnos',
  },
];
```

`app.routes.ts` solo compone rutas de primer nivel:

```typescript
{
  path: 'alumnos',
  loadChildren: () =>
    import('./features/alumnos/alumnos.routes').then(
      (m) => m.ALUMNOS_ROUTES,
    ),
}
```

Al agregar una ruta visible en el menu, actualizar tambien:

```text
src/app/shared/config/nav-items.ts
```

No declarar componentes de una feature de forma eager en `app.routes.ts`.

## 8. Imports y barrels

Actualmente `tsconfig.json` no define aliases. Por tanto:

- Usar imports relativos validos.
- No escribir `@/`, `@core`, `@shared` o `@features` hasta configurarlos.
- Se permiten barrels locales ya existentes: `../../data`, `../../models`,
  `../../ui` y `../../../../core`.
- Evitar un barrel global que reexporte toda la aplicacion y genere ciclos.

Si se adoptan aliases, debe hacerse en un cambio unico que:

1. Configure `baseUrl` y `paths`.
2. Migre los imports existentes.
3. Ejecute el build completo.

No documentar aliases como disponibles antes de realizar esos tres pasos.

## 9. Design system y estilos

Antes de crear un componente visual, revisar `src/app/shared/components/`.

Componentes preferidos:

| Necesidad | Componente |
|---|---|
| Botones | `<app-button>` |
| Estados y etiquetas | `<app-badge>` |
| Listados tabulares | `<app-data-table>` |
| Select estilizado | `<app-select>` |
| Acciones por fila | `<app-table-dropdown>` |
| Encabezado de pagina | `<app-page-breadcrumb>` |

Reglas:

- Usar `class="card"` o `class="card-flat"` para superficies.
- No repetir manualmente el patron de tarjeta de Tailwind.
- No crear tablas de listados con `<table>` si `DataTableComponent` cubre el caso.
- No usar `<select>` nativo si `SelectComponent` cubre el caso.
- No hardcodear colores hexadecimales en componentes.
- Usar tokens `brand`, `success`, `error`, `warning`, `secondary` y grises
  definidos en `src/styles.css`.
- Mantener dark mode en cualquier UI nueva.
- Editar `src/app/shared/config/nav-items.ts` como fuente unica del menu.

## 10. Modal global

La aplicacion tiene un unico outlet en `app.component.html`:

```html
<router-outlet />
<app-modal-outlet />
```

Abrir un modal:

```typescript
this.modalService.open(
  AlumnoFormModalComponent,
  { alumno },
  { size: 'lg' },
);
```

El componente dinamico declara inputs compatibles:

```typescript
readonly alumno = input.required<Alumno>();
```

Cerrar:

```typescript
private readonly modalService = inject(ModalService);

onCerrar(): void {
  this.modalService.close();
}
```

Consideraciones:

- Solo existe un modal activo; abrir otro reemplaza el actual.
- Para encadenar modales, cerrar el actual antes de abrir el siguiente.
- Tamanos disponibles: `sm`, `md`, `lg`, `xl`, `2xl`, `full`.
- No crear outlets o servicios modales adicionales por feature.

## 11. Flujo para crear una feature

Ejemplo: `alumnos`.

### Paso 1: definir el alcance

Antes de crear archivos, identificar:

- Ruta publica.
- Modelos y estados.
- Operaciones del usuario.
- Endpoint y DTO, si existe backend.
- Componentes compartidos que ya resuelven la UI.

### Paso 2: crear el esqueleto

```text
src/app/features/alumnos/
|-- data/
|-- models/
|-- feature/alumnos-page/
|-- ui/
`-- alumnos.routes.ts
```

Angular CLI puede generar los componentes:

```powershell
npx ng generate component features/alumnos/feature/alumnos-page --standalone --change-detection OnPush --style none
npx ng generate component features/alumnos/ui/alumno-table --standalone --change-detection OnPush --style none
npx ng generate service features/alumnos/data/alumnos
```

Revisar siempre el resultado del generador. No conservar archivos vacios ni
imports que no se usan.

### Paso 3: implementar en este orden

1. Crear modelos y tipos en `models/`.
2. Crear DTO y mapper si hay backend.
3. Crear API client si hay HTTP.
4. Crear servicio/store con estado y casos de uso.
5. Crear componentes UI con inputs y outputs.
6. Crear la pagina que orquesta el flujo.
7. Crear `<feature>.routes.ts`.
8. Registrar lazy loading en `app.routes.ts`.
9. Agregar el item en `nav-items.ts`, si corresponde.
10. Agregar pruebas y ejecutar build.

### Paso 4: barrels locales

Usar `index.ts` solo si reduce imports sin ocultar dependencias:

```typescript
// features/alumnos/models/index.ts
export * from './alumno.model';
export * from './alumno.types';
```

No usar `export *` para publicar detalles internos que ninguna otra capa
necesita.

## 12. Donde crear cada archivo

| Necesidad | Ubicacion |
|---|---|
| Pagina de una ruta | `features/<x>/feature/<x>-page/` |
| Tabla, toolbar o selector propio del dominio | `features/<x>/ui/` |
| Modal propio del dominio | `features/<x>/ui/modals/` |
| Estado y casos de uso de la feature | `features/<x>/data/` |
| Cliente HTTP de la feature | `features/<x>/data/<x>.api.ts` |
| Modelo, DTO o tipos del dominio | `features/<x>/models/` |
| Componente visual generico | `shared/components/` |
| Pipe generico | `shared/pipes/` |
| Layout de aplicacion | `shared/layout/` |
| Servicio global de infraestructura | `core/services/` o subdominio de `core/` |
| Guard o interceptor global | `core/auth/`, `core/http/` o carpeta equivalente |
| Imagen o archivo estatico | `public/` |

## 13. HTTP y manejo de errores

Cuando se incorpore la API:

1. Registrar `provideHttpClient()` en `app.config.ts`.
2. Centralizar URL base mediante configuracion o `InjectionToken`.
3. Crear interceptores funcionales para autenticacion y errores.
4. Tipar cada respuesta con DTOs.
5. Mapear errores a un tipo estable para la UI.
6. No mostrar directamente `HttpErrorResponse` en componentes.
7. Cancelar o reemplazar solicitudes de busqueda con operadores como
   `switchMap`.

Ejemplo de API client:

```typescript
@Injectable({ providedIn: 'root' })
export class AlumnosApi {
  private readonly http = inject(HttpClient);

  listar(): Observable<AlumnoDto[]> {
    return this.http.get<AlumnoDto[]>('/api/alumnos');
  }
}
```

## 14. Pruebas y validacion

Minimo antes de considerar una feature terminada:

```powershell
npm run build
npm test
```

Cobertura prioritaria:

- Servicios: filtros, paginacion, transiciones de estado y errores.
- Mappers: datos incompletos, nulos y formatos del backend.
- Componentes UI: inputs, outputs y estados vacio/loading.
- Paginas: coordinacion de acciones importantes.
- Rutas: carga lazy y guards cuando existan.

No afirmar que un cambio esta completo si no compila. Si no se pudieron ejecutar
pruebas, dejarlo indicado explicitamente.

## 15. Deuda tecnica conocida

Estos puntos existen hoy, pero no deben propagarse:

1. Parte de `shared/` aun usa APIs heredadas: constructores, `@Input()`,
   `@Output()` y algunos `any`.
2. Algunos componentes UI de matriculacion abren modales o inyectan servicios
   de datos; los nuevos flujos deben orquestarse desde la pagina.
3. Hay fixtures grandes dentro de servicios; deben extraerse cuando se conecte
   el backend o crezca la logica.
4. `example-pdf-viewer/` esta fuera de una feature y debe considerarse ejemplo
   temporal.
5. No hay aliases configurados aunque algunas guias anteriores los mostraban.
6. `app.config.ts` todavia no registra `HttpClient`; debe agregarse al integrar
   la primera API real.

La deuda se corrige de forma incremental al tocar cada area. No hacer una
reescritura masiva de TailAdmin sin pruebas y sin una necesidad funcional.

## 16. Checklist de revision

Antes de aprobar codigo nuevo:

- [ ] El archivo esta en la capa correcta.
- [ ] La feature no importa otra feature.
- [ ] El componente es standalone y usa OnPush.
- [ ] El codigo nuevo usa `inject()`, `input()` y `output()`.
- [ ] No se introdujeron `any`, `@ts-ignore` o casts inseguros.
- [ ] No hay HTTP directo desde componentes.
- [ ] La UI reutiliza componentes y tokens existentes.
- [ ] La ruta usa lazy loading.
- [ ] El menu se actualizo si la ruta debe ser visible.
- [ ] Los modales usan el outlet global.
- [ ] Los estados loading, vacio y error estan contemplados.
- [ ] El build y las pruebas pasan.

## 17. Referencias del repositorio

- `CLAUDE.md`: reglas especificas del design system.
- `references/folder-structure.md`: explicacion amplia de capas.
- `references/typing-conventions.md`: tipado estricto y DTO/modelo.
- `references/state-management.md`: patrones de estado con signals.
- `references/multi-api-strategy.md`: integracion con multiples APIs.
- `references/templates/new-feature-templates.md`: plantillas de ejemplo.

En caso de contradiccion, prevalecen el codigo vigente y este documento.
