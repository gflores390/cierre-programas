import { Injectable, signal } from '@angular/core';

export type NavLayout = 'vertical' | 'horizontal' | 'mini';
export type NavColor = 'integrate' | 'apparent';

const STORAGE_KEY = 'minimal-settings';

interface SettingsState {
  compact: boolean;
  rtl: boolean;
  contrast: boolean;
  navLayout: NavLayout;
  navColor: NavColor;
}

const DEFAULT_STATE: SettingsState = {
  compact: false,
  rtl: false,
  contrast: false,
  navLayout: 'vertical',
  navColor: 'integrate',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly state = this.cargar();

  readonly isOpen = signal(false);
  readonly compact = signal(this.state.compact);
  readonly rtl = signal(this.state.rtl);
  readonly contrast = signal(this.state.contrast);
  readonly navLayout = signal<NavLayout>(this.state.navLayout);
  readonly navColor = signal<NavColor>(this.state.navColor);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggleCompact(): void {
    this.compact.update((v) => !v);
    this.guardar();
  }

  toggleRtl(): void {
    this.rtl.update((v) => !v);
    this.guardar();
  }

  toggleContrast(): void {
    this.contrast.update((v) => !v);
    this.guardar();
  }

  setNavLayout(layout: NavLayout): void {
    this.navLayout.set(layout);
    this.guardar();
  }

  setNavColor(color: NavColor): void {
    this.navColor.set(color);
    this.guardar();
  }

  resetear(): void {
    this.compact.set(DEFAULT_STATE.compact);
    this.rtl.set(DEFAULT_STATE.rtl);
    this.contrast.set(DEFAULT_STATE.contrast);
    this.navLayout.set(DEFAULT_STATE.navLayout);
    this.navColor.set(DEFAULT_STATE.navColor);
    this.guardar();
  }

  private cargar(): SettingsState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  private guardar(): void {
    const data: SettingsState = {
      compact: this.compact(),
      rtl: this.rtl(),
      contrast: this.contrast(),
      navLayout: this.navLayout(),
      navColor: this.navColor(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
