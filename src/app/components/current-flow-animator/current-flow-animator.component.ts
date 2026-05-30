import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-current-flow-animator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-flow-animator.component.html',
  styleUrls: ['./current-flow-animator.component.scss']
})
export class CurrentFlowAnimatorComponent {
  @Input() mode: 'serie' | 'paralelo' = 'serie';
  @Input() sourceVoltage = 10;

  r1 = signal(100);
  r2 = signal(330);

  current = computed(() => {
    const v = this.sourceVoltage;
    const r1 = this.r1();
    const r2 = this.r2();

    if (this.mode === 'serie') {
      return v / (r1 + r2);
    }

    const req = (r1 * r2) / (r1 + r2);
    return v / req;
  });

  arrowWidth = computed(() => Math.min(14, Math.max(2, this.current() * 15)));

  get currentText() {
    return this.current() * 1000;
  }

  setMode(value: 'serie' | 'paralelo') {
    this.mode = value;
  }

  updateR1(value: string) {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed)) {
      this.r1.set(parsed);
    }
  }

  updateR2(value: string) {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed)) {
      this.r2.set(parsed);
    }
  }
}
