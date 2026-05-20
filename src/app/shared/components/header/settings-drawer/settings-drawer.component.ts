import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { PaletaService } from '../../../services/paleta.service';
import {
  NavColor,
  NavLayout,
  SettingsService,
} from '../../../services/settings.service';
import { ThemeService } from '../../../services/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './settings-drawer.component.html',
})
export class SettingsDrawerComponent {
  private readonly settings = inject(SettingsService);
  private readonly paleta = inject(PaletaService);
  private readonly themeService = inject(ThemeService);

  readonly isOpen = this.settings.isOpen;
  readonly compact = this.settings.compact;
  readonly rtl = this.settings.rtl;
  readonly contrast = this.settings.contrast;
  readonly navLayout = this.settings.navLayout;
  readonly navColor = this.settings.navColor;

  readonly presets = this.paleta.presets;
  readonly presetActual = this.paleta.presetId;

  private readonly theme = toSignal(this.themeService.theme$, {
    initialValue: 'light' as 'light' | 'dark',
  });
  readonly isDark = computed(() => this.theme() === 'dark');

  readonly layouts: { id: NavLayout; etiqueta: string }[] = [
    { id: 'vertical', etiqueta: 'Vertical' },
    { id: 'horizontal', etiqueta: 'Horizontal' },
    { id: 'mini', etiqueta: 'Mini' },
  ];

  readonly modificado = computed(() => {
    const algunCambio =
      this.isDark() ||
      this.compact() ||
      this.rtl() ||
      this.contrast() ||
      this.navLayout() !== 'vertical' ||
      this.navColor() !== 'integrate' ||
      this.presetActual() !== 'green';
    return algunCambio;
  });

  cerrar(): void {
    this.settings.close();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleCompact(): void {
    this.settings.toggleCompact();
  }

  toggleRtl(): void {
    this.settings.toggleRtl();
  }

  toggleContrast(): void {
    this.settings.toggleContrast();
  }

  setLayout(layout: NavLayout): void {
    this.settings.setNavLayout(layout);
  }

  setNavColor(color: NavColor): void {
    this.settings.setNavColor(color);
  }

  setPreset(id: string): void {
    this.paleta.cambiarPreset(id);
  }

  resetear(): void {
    if (this.isDark()) this.themeService.toggleTheme();
    this.settings.resetear();
    this.paleta.resetear();
  }
}
