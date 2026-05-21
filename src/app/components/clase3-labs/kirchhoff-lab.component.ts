import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-kirchhoff-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './kirchhoff-lab.component.html',
  styleUrls: ['./clase3-lab.scss']
})
export class KirchhoffLabComponent {
  readonly Math = Math;
  modo = input<'kcl' | 'kvl'>('kcl');

  iIn1 = signal(3);
  iIn2 = signal(2);
  iOut1 = signal(0);
  iOut2 = signal(0);

  kclSum = computed(() => this.iIn1() + this.iIn2() - this.iOut1() - this.iOut2());
  iOutCalc = computed(() => this.iIn1() + this.iIn2() - this.iOut1() - this.iOut2());

  vSource = signal(10);
  r1 = signal(4);
  r2 = signal(6);

  iLoop = computed(() => {
    const rt = this.r1() + this.r2();
    return rt > 0 ? this.vSource() / rt : 0;
  });
  vR1 = computed(() => this.iLoop() * this.r1());
  vR2 = computed(() => this.iLoop() * this.r2());
  kvlSum = computed(() => this.vSource() - this.vR1() - this.vR2());
}
