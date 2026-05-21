import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

type Mode = 'serie' | 'paralelo' | 'mixto';

@Component({
  selector: 'app-topology-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './topology-lab.component.html',
  styleUrls: ['./clase3-lab.scss']
})
export class TopologyLabComponent {
  mode = signal<Mode>('serie');
  vSource = signal(12);

  r1 = signal(100);
  r2 = signal(220);
  r3 = signal(330);
  r4 = signal(470);

  rPar2 = signal(120);
  rPar3 = signal(180);
  rSeries1 = signal(100);
  rSeries4 = signal(200);

  resistorsSerie = computed(() => [this.r1(), this.r2(), this.r3()]);
  resistorsParalelo = computed(() => [this.r1(), this.r2()]);

  rEqSerie = computed(() => this.resistorsSerie().reduce((a, b) => a + b, 0));
  rEqParalelo = computed(() => {
    const rs = this.resistorsParalelo().filter((x) => x > 0);
    if (!rs.length) return 0;
    return 1 / rs.reduce((s, ri) => s + 1 / ri, 0);
  });
  rEqMixto = computed(() => {
    const rp = 1 / (1 / Math.max(this.rPar2(), 0.1) + 1 / Math.max(this.rPar3(), 0.1));
    return this.rSeries1() + rp + this.rSeries4();
  });

  rEq = computed(() => {
    if (this.mode() === 'serie') return this.rEqSerie();
    if (this.mode() === 'paralelo') return this.rEqParalelo();
    return this.rEqMixto();
  });

  iTotal = computed(() => {
    const rt = this.rEq();
    return rt > 0 ? this.vSource() / rt : 0;
  });

  formula = computed(() => {
    if (this.mode() === 'serie') return 'R_T = R_1 + R_2 + R_3';
    if (this.mode() === 'paralelo') return '\\frac{1}{R_T} = \\frac{1}{R_1} + \\frac{1}{R_2}';
    return 'R_T = R_1 + (R_2 \\parallel R_3) + R_4';
  });

  setMode(m: Mode) {
    this.mode.set(m);
  }
}
