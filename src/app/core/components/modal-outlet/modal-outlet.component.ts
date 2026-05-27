import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ModalService } from '../../services/modal.service';

const SIZE_CLASS: Record<string, string> = {
  sm:   'max-w-[420px] p-5 lg:p-6',
  md:   'max-w-[540px] p-6 lg:p-8',
  lg:   'max-w-[720px] p-6 lg:p-8',
  xl:   'max-w-[960px] p-6 lg:p-8',
  '2xl': 'max-w-[1200px] p-6 lg:p-8',
  full: 'max-w-[calc(100vw-48px)] max-h-[calc(100vh-48px)] p-6 lg:p-8',
};

@Component({
  selector: 'app-modal-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, NgComponentOutlet],
  template: `
    <app-modal
      [isOpen]="!!modalService.active()"
      [className]="sizeClass()"
      (close)="modalService.close()"
    >
      @if (modalService.active(); as active) {
        <ng-container
          [ngComponentOutlet]="active.component"
          [ngComponentOutletInputs]="active.inputs"
        />
      }
    </app-modal>
  `,
})
export class ModalOutletComponent {
  readonly modalService = inject(ModalService);

  readonly sizeClass = computed(() => {
    const size = this.modalService.active()?.config.size ?? 'md';
    return SIZE_CLASS[size];
  });
}
