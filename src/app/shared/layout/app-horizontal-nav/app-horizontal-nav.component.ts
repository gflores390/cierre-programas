import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { MAIN_NAV_ITEMS, OTHERS_NAV_ITEMS, NavItem } from '../../config/nav-items';

@Component({
  selector: 'app-horizontal-nav',
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-horizontal-nav.component.html',
})
export class AppHorizontalNavComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly items: NavItem[] = [...MAIN_NAV_ITEMS, ...OTHERS_NAV_ITEMS];

  openIndex: number | null = null;

  toggle(i: number): void {
    this.openIndex = this.openIndex === i ? null : i;
  }

  cerrar(): void {
    this.openIndex = null;
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (this.openIndex === null || !(target instanceof Node)) return;
    if (!this.host.nativeElement.contains(target)) {
      this.cerrar();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrar();
  }
}
