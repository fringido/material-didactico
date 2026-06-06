import { Component, Input, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ac-signal-simulator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ac-signal-simulator.component.html',
  styleUrls: ['./ac-signal-simulator.component.scss'],
})
export class AcSignalSimulatorComponent implements OnInit, OnDestroy {
  @Input() simulacion: any;

  private readonly fb = new FormBuilder();

  vm  = signal(10);
  f   = signal(60);
  phi = signal(0);

  t   = signal(0);
  isPlaying = signal(true);
  private raf?: number;

  vrms    = computed(() => +(this.vm() / Math.sqrt(2)).toFixed(3));
  periodo = computed(() => +(1000 / this.f()).toFixed(2));
  omega   = computed(() => +(2 * Math.PI * this.f()).toFixed(1));
  fasor   = computed(() => `${this.vm()}∠${this.phi()}°`);

  form = this.fb.group({ vm: [10], f: [60], phi: [0] });

  ngOnInit() {
    if (this.simulacion?.controles) {
      const defaults: Record<string, number> = {};
      for (const c of this.simulacion.controles) defaults[c.id] = c.default;
      this.vm.set(defaults['vm'] ?? 10);
      this.f.set(defaults['f'] ?? 60);
      this.phi.set(defaults['phi'] ?? 0);
      this.form.setValue({ vm: this.vm(), f: this.f(), phi: this.phi() });
    }
    this.animate();
  }

  ngOnDestroy() { if (this.raf) cancelAnimationFrame(this.raf); }

  private animate() {
    const step = () => {
      if (this.isPlaying()) this.t.update(v => (v + 0.04) % (2 * Math.PI));
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  togglePlay() { this.isPlaying.update(v => !v); }

  apply() {
    const v = this.form.value;
    this.vm.set(Number(v.vm) || 10);
    this.f.set(Number(v.f) || 60);
    this.phi.set(Number(v.phi) || 0);
  }

  get wavePath(): string {
    const points: string[] = [];
    const W = 340, H = 100, cy = H / 2;
    const t = this.t();
    const phiRad = (this.phi() * Math.PI) / 180;
    const vScale = (cy - 8) / Math.max(this.vm(), 1);

    for (let i = 0; i <= 120; i++) {
      const x = (i / 120) * W;
      const angle = (i / 120) * 4 * Math.PI - t;
      const y = cy - this.vm() * Math.sin(angle + phiRad) * vScale;
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }

  get phasorPath(): string {
    const cx = 60, cy = 60, r = 45;
    const phiRad = (this.phi() * Math.PI) / 180;
    const t = this.t();
    const angle = -t - phiRad;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `M${cx},${cy} L${x.toFixed(1)},${y.toFixed(1)}`;
  }

  get phasorTip(): { x: number; y: number } {
    const cx = 60, cy = 60, r = 45;
    const phiRad = (this.phi() * Math.PI) / 180;
    const angle = -this.t() - phiRad;
    return { x: +(cx + r * Math.cos(angle)).toFixed(1), y: +(cy + r * Math.sin(angle)).toFixed(1) };
  }
}
