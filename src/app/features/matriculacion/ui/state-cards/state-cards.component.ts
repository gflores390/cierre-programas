import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-state-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './state-cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateCardsComponent {
  @Input() data: { label: string; value: number }[] = [];

  getPercent(value: number): number {
    const max = Math.max(...this.data.map(d => d.value), 1);
    return Math.round((value / max) * 100);
  }
}