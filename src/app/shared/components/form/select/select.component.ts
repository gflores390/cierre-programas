import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.component.html',
})
export class SelectComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly options = input.required<SelectOption[]>();
  readonly value = input<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly size = input<SelectSize>('md');
  readonly id = input<string>('');
  readonly className = input<string>('');

  readonly valueChange = output<string>();

  readonly open = signal(false);
  readonly focusIndex = signal(0);

  readonly selected = computed(() =>
    this.options().find((o) => o.value === this.value()) ?? null,
  );

  readonly hasValue = computed(() => !!this.selected());
  readonly showFloat = computed(() => this.open() || this.hasValue());

  readonly triggerHeightClass = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'h-9';
      case 'lg':
        return 'h-12';
      default:
        return 'h-11';
    }
  });

  private suppressNextClick = false;

  onTriggerClick(): void {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }
    this.toggle();
  }

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
    if (this.open()) {
      const i = this.options().findIndex((o) => o.value === this.value());
      this.focusIndex.set(i >= 0 ? i : 0);
    }
  }

  select(opt: SelectOption): void {
    if (opt.disabled) return;
    if (opt.value !== this.value()) {
      this.valueChange.emit(opt.value);
    }
    this.open.set(false);
  }

  isSelected(opt: SelectOption): boolean {
    return opt.value === this.value();
  }

  optionClass(opt: SelectOption, index: number): string {
    if (opt.disabled) {
      return 'cursor-not-allowed text-gray-300 dark:text-gray-700';
    }
    if (this.isSelected(opt)) {
      return 'cursor-pointer bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300';
    }
    if (index === this.focusIndex()) {
      return 'cursor-pointer bg-gray-100 text-gray-800 dark:bg-white/[0.06] dark:text-white';
    }
    return 'cursor-pointer text-gray-700 dark:text-gray-300';
  }

  onKeydown(ev: KeyboardEvent): void {
    if (this.disabled()) return;

    if (ev.key === 'Escape' && this.open()) {
      this.open.set(false);
      ev.preventDefault();
      return;
    }

    if (ev.key === 'ArrowDown') {
      if (!this.open()) {
        this.toggle();
      } else {
        this.focusIndex.update((i) =>
          Math.min(this.options().length - 1, i + 1),
        );
      }
      ev.preventDefault();
      return;
    }

    if (ev.key === 'ArrowUp') {
      if (this.open()) {
        this.focusIndex.update((i) => Math.max(0, i - 1));
        ev.preventDefault();
      }
      return;
    }

    if (ev.key === 'Home' && this.open()) {
      this.focusIndex.set(0);
      ev.preventDefault();
      return;
    }

    if (ev.key === 'End' && this.open()) {
      this.focusIndex.set(this.options().length - 1);
      ev.preventDefault();
      return;
    }

    if (ev.key === 'Enter' && this.open()) {
      const opt = this.options()[this.focusIndex()];
      if (opt) this.select(opt);
      this.suppressNextClick = true;
      ev.preventDefault();
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.open()) return;
    if (!(target instanceof Node)) return;
    if (!this.host.nativeElement.contains(target)) this.open.set(false);
  }
}
