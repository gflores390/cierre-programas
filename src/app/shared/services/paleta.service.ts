import { Injectable, computed, effect, signal } from '@angular/core';

export interface ColorPaleta {
  id: string;
  nombre: string;
  color: string;
  colores: {
    25: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
}

export const PALETAS: ColorPaleta[] = [
  {
    id: 'green',
    nombre: 'Verde',
    color: '#00A76F',
    colores: {
      25: '#f0fbf6', 50: '#e0f7ec', 100: '#c8fad6', 200: '#98f0bd',
      300: '#5be49b', 400: '#2dcd80', 500: '#00a76f', 600: '#008f62',
      700: '#007867', 800: '#005f5b', 900: '#004b50', 950: '#003035',
    },
  },
  {
    id: 'blue',
    nombre: 'Azul',
    color: '#1877F2',
    colores: {
      25: '#f4f9fe', 50: '#eaf5fe', 100: '#d1e9fc', 200: '#a4d2f9',
      300: '#76b0f1', 400: '#4a96ec', 500: '#1877f2', 600: '#1259c6',
      700: '#0c44ae', 800: '#082f8a', 900: '#042174', 950: '#021046',
    },
  },
  {
    id: 'purple',
    nombre: 'Púrpura',
    color: '#7635DC',
    colores: {
      25: '#f8f1ff', 50: '#f0e1ff', 100: '#ebd6fe', 200: '#d3aaff',
      300: '#b985f4', 400: '#985dea', 500: '#7635dc', 600: '#5723c2',
      700: '#431a9e', 800: '#2f1383', 900: '#200a69', 950: '#110340',
    },
  },
  {
    id: 'cyan',
    nombre: 'Cyan',
    color: '#078DEE',
    colores: {
      25: '#e3f7fe', 50: '#d6f4fe', 100: '#cafdf5', 200: '#92ddf9',
      300: '#68cdf9', 400: '#2eb5f4', 500: '#078dee', 600: '#056cca',
      700: '#0351ab', 800: '#023a8a', 900: '#012972', 950: '#011640',
    },
  },
  {
    id: 'orange',
    nombre: 'Naranja',
    color: '#FDA92D',
    colores: {
      25: '#fff9ee', 50: '#fff3dc', 100: '#ffe9ca', 200: '#fed8a8',
      300: '#fed28f', 400: '#feb963', 500: '#fda92d', 600: '#d68220',
      700: '#b66816', 800: '#92500e', 900: '#793908', 950: '#4a2300',
    },
  },
  {
    id: 'red',
    nombre: 'Rojo',
    color: '#FF3030',
    colores: {
      25: '#fff5f0', 50: '#ffeae0', 100: '#ffe3d5', 200: '#ffbba6',
      300: '#ff926f', 400: '#ff6850', 500: '#ff3030', 600: '#db1f33',
      700: '#b71833', 800: '#93112e', 900: '#7a0a24', 950: '#4a0410',
    },
  },
];

const STORAGE_KEY = 'minimal-color-preset';
const DEFAULT_ID = 'green';

@Injectable({ providedIn: 'root' })
export class PaletaService {
  private readonly _presetId = signal<string>(this.cargarInicial());

  readonly presetId = this._presetId.asReadonly();
  readonly presets = PALETAS;
  readonly preset = computed(
    () => PALETAS.find((p) => p.id === this._presetId()) ?? PALETAS[0],
  );

  constructor() {
    effect(() => this.aplicar(this.preset()));
  }

  cambiarPreset(id: string): void {
    if (!PALETAS.some((p) => p.id === id)) return;
    localStorage.setItem(STORAGE_KEY, id);
    this._presetId.set(id);
  }

  resetear(): void {
    this.cambiarPreset(DEFAULT_ID);
  }

  private cargarInicial(): string {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado && PALETAS.some((p) => p.id === guardado)
      ? guardado
      : DEFAULT_ID;
  }

  private aplicar(preset: ColorPaleta): void {
    const root = document.documentElement;
    Object.entries(preset.colores).forEach(([escala, valor]) => {
      root.style.setProperty(`--color-brand-${escala}`, valor);
    });
    const rgb = this.hexARgb(preset.colores[500]);
    root.style.setProperty(
      '--shadow-focus-ring',
      `0px 0px 0px 4px rgba(${rgb}, 0.16)`,
    );
  }

  private hexARgb(hex: string): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
}
