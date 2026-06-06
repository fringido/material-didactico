import { Component, Input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-impedance-lab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './impedance-lab.component.html',
  styleUrls: ['./impedance-lab.component.scss'],
})
export class ImpedanceLabComponent {
  @Input() simulacion: any;

  private readonly fb = new FormBuilder();

  r   = signal(100);   // Ω
  l   = signal(50);    // mH
  c   = signal(100);   // µF
  f   = signal(100);   // Hz

  form = this.fb.group({ r: [100], l: [50], c: [100], f: [100] });

  xL = computed(() => {
    const xl = 2 * Math.PI * this.f() * this.l() / 1000;
    return +xl.toFixed(3);
  });

  xC = computed(() => {
    const xc = 1 / (2 * Math.PI * this.f() * this.c() / 1e6);
    return +xc.toFixed(3);
  });

  xNet = computed(() => +(this.xL() - this.xC()).toFixed(3));

  zMag = computed(() => {
    return +Math.sqrt(this.r() ** 2 + this.xNet() ** 2).toFixed(3);
  });

  theta = computed(() => {
    return +(Math.atan2(this.xNet(), this.r()) * 180 / Math.PI).toFixed(1);
  });

  f0 = computed(() => {
    if (this.l() <= 0 || this.c() <= 0) return 0;
    return +(1 / (2 * Math.PI * Math.sqrt(this.l() / 1000 * this.c() / 1e6))).toFixed(1);
  });

  isResonance = computed(() => Math.abs(this.xNet()) < 2);

  apply() {
    const v = this.form.value;
    this.r.set(Number(v.r) || 100);
    this.l.set(Number(v.l) || 50);
    this.c.set(Number(v.c) || 100);
    this.f.set(Number(v.f) || 100);
  }

  /** Phasor diagram path: R on x-axis, X on y-axis, Z hypotenuse */
  get phasorPaths() {
    const scale = 60 / Math.max(this.zMag(), 1);
    const cx = 70, cy = 70;
    const rScaled  = this.r()    * scale;
    const xScaled  = this.xNet() * scale;

    const rEnd  = { x: cx + rScaled, y: cy };
    const zEnd  = { x: cx + rScaled, y: cy - xScaled };

    return {
      r:     `M${cx},${cy} L${rEnd.x.toFixed(1)},${rEnd.y.toFixed(1)}`,
      x:     `M${rEnd.x.toFixed(1)},${rEnd.y.toFixed(1)} L${zEnd.x.toFixed(1)},${zEnd.y.toFixed(1)}`,
      z:     `M${cx},${cy} L${zEnd.x.toFixed(1)},${zEnd.y.toFixed(1)}`,
      zTip:  zEnd,
    };
  }

  fmt(n: number) { return String(n); }
}
