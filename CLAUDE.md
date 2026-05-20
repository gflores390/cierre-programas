# Convenciones del proyecto

Sistema admin Angular 21.2 + Tailwind v4 con design system inspirado en Minimal UI (minimals.cc).

## Stack
- Angular 21.2.x standalone, signals, `ChangeDetectionStrategy.OnPush`
- Tailwind v4 con `@theme` (CSS variables en `:root`)
- Arquitectura feature-based: `features/[nombre]/{feature,ui,data,models}/`

## Estilos globales (todo opt-in mediante clase, todos los tokens automáticos)

### Tokens — `src/styles.css` `@theme`
Disponibles como clases Tailwind sin configurar nada:
- Colores: `bg-brand-*`, `text-success-*`, `text-error-*`, `text-warning-*`, `text-info-*`, `bg-secondary-*`
- Sombras Minimal: `shadow-card`, `shadow-dropdown`, `shadow-dialog`, `shadow-z1`…`shadow-z24`
- Tipografía: Public Sans (`font-sans`)

### Utility classes — `@utility` en `styles.css`
- `.card` — tarjeta estándar (rounded-2xl + bg-white + shadow-card, dark:bg-gray-900). Reemplaza el antiguo `rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`.
- `.card-flat` — variante con sombra menor (z1) para anidados
- `.menu-item`, `.menu-dropdown-item`, badges del menú

### Paleta runtime
El `ColorPaletaService` (`shared/services/paleta.service.ts`) escribe CSS variables en `:root` para que `bg-brand-*` cambie según el preset elegido en el Settings drawer.

## Componentes reutilizables

| Componente | Uso |
|---|---|
| `<app-button>` | Botones (variants: primary, outline) |
| `<app-badge>` | Etiquetas con color (`success`, `warning`, `error`, `info`, etc.) |
| `<app-data-table>` | Tablas — usar SIEMPRE para listados (ver más abajo) |
| `<app-select>` | Select con label flotante Minimal UI (dropdown custom, no nativo) |
| `<app-table-dropdown>` | Menú contextual en filas |
| `<app-page-breadcrumb>` | Breadcrumb de página |

### Reglas de uso

1. **Nunca** reescribir el patrón `rounded-2xl border border-gray-200 …` — usar `class="card"`.
2. **Nunca** construir `<table>` a mano para listados — usar `<app-data-table>` con `<ng-template appColumn="…">`.
3. **Nunca** usar `<select>` nativo — usar `<app-select>` para que herede el estilo Minimal UI con label flotante, dropdown estilizado y keyboard nav.
4. **Nunca** hardcodear colores hex — usar tokens del `@theme`.
5. Componentes nuevos: `standalone: true` + `ChangeDetectionStrategy.OnPush` + signals (`input.required`, `output`, `computed`, `effect`).

## Select — patrón estándar para dropdowns

```ts
import { SelectComponent, SelectOption } from '@/shared/components/form/select/select.component';

readonly opciones: SelectOption[] = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
];
```

```html
<app-select
  label="Gestión"
  [options]="opciones"
  [value]="gestion()"
  (valueChange)="onGestionChange($event)"
/>
```

- `label` — texto que flota al borde del trigger (estilo Minimal). Si se omite, cae al patrón `placeholder` clásico.
- `size` — `'sm'` (h-9) | `'md'` (h-11, default) | `'lg'` (h-12).
- Keyboard: ↑/↓ navegar, Enter seleccionar, Esc cerrar, Home/End extremos.
- El `app-select` asume que el padre es `.card` (bg blanco/gray-900) — la "muesca" del label usa `bg-white dark:bg-gray-900`.

## DataTable — patrón estándar para listados

```ts
import { ColumnDef, ColumnTemplateDirective, DataTableComponent } from '@/shared/components/data-table';

@Component({
  imports: [DataTableComponent, ColumnTemplateDirective, ...],
})
export class MiListaComponent {
  readonly rows = input.required<MiTipo[]>();
  readonly columns: ColumnDef<MiTipo>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true, value: r => r.nombre },
    { key: 'estado', header: 'Estado', align: 'center' },
    { key: 'acciones', header: '', align: 'right', width: '64px' },
  ];
}
```

```html
<app-data-table [rows]="rows()" [columns]="columns" [pageSize]="10" [pageIndex]="page() - 1"
  (pageIndexChange)="onPage($event + 1)">
  <ng-template appColumn="estado" [appColumnTypeOf]="rows()" let-row>
    <app-badge [color]="colorPara(row.estado)">{{ row.estado }}</app-badge>
  </ng-template>
</app-data-table>
```

El `[appColumnTypeOf]="rows()"` es un marker para que TypeScript infiera el tipo de `row` automáticamente.

## Layout

`AppLayoutComponent` lee `SettingsService.navLayout()` y renderiza:
- `vertical` — sidebar a la izquierda (default)
- `horizontal` — `<app-horizontal-nav>` debajo del header, sin sidebar
- `mini` — sidebar colapsado a 90px sin hover-expand

Items del menú: editar `src/app/shared/config/nav-items.ts` — fuente única para sidebar y horizontal nav.

## Settings persistidas
- `minimal-settings` (localStorage) — drawer state (compact, rtl, contrast, navLayout, navColor)
- `minimal-paleta` (localStorage) — preset de color activo

## Anti-patrones a evitar
- ❌ Hardcodear `rounded-2xl border border-gray-200 bg-white …`
- ❌ Construir tablas a mano cuando existe `<app-data-table>`
- ❌ Usar `<select>` nativo cuando existe `<app-select>`
- ❌ Crear componentes con NgModule (todos standalone)
- ❌ Inyectar dependencias por constructor cuando puedes usar `inject()`
- ❌ Usar `subscribe()` en template/component cuando puedes usar `toSignal()` o `async` pipe
