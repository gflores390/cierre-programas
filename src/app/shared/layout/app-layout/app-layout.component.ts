import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { SettingsService } from '../../services/settings.service';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { BackdropComponent } from '../backdrop/backdrop.component';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppHorizontalNavComponent } from '../app-horizontal-nav/app-horizontal-nav.component';
import { SettingsDrawerComponent } from '../../components/header/settings-drawer/settings-drawer.component';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    AppHeaderComponent,
    AppSidebarComponent,
    AppHorizontalNavComponent,
    BackdropComponent,
    SettingsDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent {
  private readonly sidebarService = inject(SidebarService);
  private readonly settings = inject(SettingsService);

  readonly navLayout = this.settings.navLayout;
  readonly isExpanded = toSignal(this.sidebarService.isExpanded$, { initialValue: true });
  readonly isHovered = toSignal(this.sidebarService.isHovered$, { initialValue: false });
  readonly isMobileOpen = toSignal(this.sidebarService.isMobileOpen$, { initialValue: false });

  readonly mainMarginClass = computed(() => {
    const layout = this.navLayout();
    if (layout === 'horizontal') return '';
    if (layout === 'mini') return 'xl:ml-[90px]';
    const open = this.isExpanded() || this.isHovered();
    return open ? 'xl:ml-[290px]' : 'xl:ml-[90px]';
  });

  readonly mobileMarginClass = computed(() => (this.isMobileOpen() ? 'ml-0' : ''));

  constructor() {
    // Cuando se activa el modo mini, colapsamos el sidebar.
    effect(() => {
      if (this.navLayout() === 'mini') {
        this.sidebarService.setExpanded(false);
      }
    });
  }
}
