import { Injectable, Type, signal } from '@angular/core';

export interface ModalConfig {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ActiveModal {
  component: Type<unknown>;
  inputs: Record<string, unknown>;
  config: ModalConfig;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly _active = signal<ActiveModal | null>(null);
  readonly active = this._active.asReadonly();

  open<T>(
    component: Type<T>,
    inputs: Record<string, unknown> = {},
    config: ModalConfig = {}
  ): void {
    this._active.set({ component: component as Type<unknown>, inputs, config });
  }

  close(): void {
    this._active.set(null);
  }

  /** @deprecated usar close() */
  closeModal(): void { this.close(); }
}
