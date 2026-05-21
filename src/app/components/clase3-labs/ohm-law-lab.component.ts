import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

type SolveFor = 'V' | 'I' | 'R';

@Component({
  selector: 'app-ohm-law-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './ohm-law-lab.component.html',
  styleUrls: ['./clase3-lab.scss']
})
export class OhmLawLabComponent {
  solveFor = signal<SolveFor>('V');
  v = signal(12);
  i = signal(0.5);
  r = signal(24);

  hiddenVar = computed(() => this.solveFor());

  result = computed(() => {
    const target = this.solveFor();
    const v = this.v();
    const i = this.i();
    const r = this.r();
    if (target === 'V') return i * r;
    if (target === 'I') return r > 0 ? v / r : 0;
    return i > 0 ? v / i : 0;
  });

  formulaDisplay = computed(() => {
    switch (this.solveFor()) {
      case 'V': return 'V = I \\cdot R';
      case 'I': return 'I = \\frac{V}{R}';
      case 'R': return 'R = \\frac{V}{I}';
    }
  });

  setSolveFor(v: SolveFor) {
    this.solveFor.set(v);
  }

  isHidden(v: SolveFor): boolean {
    return this.hiddenVar() === v;
  }
}
