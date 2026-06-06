import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

/** Preset hidden networks (student doesn't see R1/R2/VS until revealed) */
interface NetworkPreset {
  label: string;
  vs: number;
  r1: number;
  r2: number;
}

type LoadType = 'resistiva' | 'inductiva' | 'capacitiva';

const PRESETS: NetworkPreset[] = [
  { label: 'Red A',  vs: 12,  r1: 10,  r2: 20  },
  { label: 'Red B',  vs: 9,   r1: 4.7, r2: 10  },
  { label: 'Red C',  vs: 24,  r1: 47,  r2: 100 },
  { label: 'Red D',  vs: 5,   r1: 1,   r2: 2.2 },
];

@Component({
  selector: 'app-black-box-simulator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './black-box-simulator.component.html',
  styleUrls: ['./black-box-simulator.component.scss'],
})
export class BlackBoxSimulatorComponent {
  private readonly fb = new FormBuilder();

  presets = PRESETS;
  selectedPresetIndex = signal(0);
  revealed = signal(false);
  loadType = signal<LoadType>('resistiva');

  form = this.fb.group({
    rl:   [15,  [Validators.required, Validators.min(0.1), Validators.max(100000)]],
    freq: [60,  [Validators.required, Validators.min(1),   Validators.max(100000)]],
    l:    [0.1, [Validators.required, Validators.min(0.001), Validators.max(100)]],
    c:    [100, [Validators.required, Validators.min(0.001), Validators.max(1000000)]],
  });

  // Reactive measurement values applied on "Medir"
  rl    = signal(15);
  freq  = signal(60);
  l     = signal(0.1);     // henries
  c     = signal(100);     // microfarads

  // Measurement history: up to 5 rows
  measurements = signal<{ rl: number; vl: number; il: number; pl: number; loadType: LoadType }[]>([]);

  private get preset(): NetworkPreset {
    return PRESETS[this.selectedPresetIndex()];
  }

  /** Thévenin from hidden network (divisor R2 en terminal) */
  vth = computed(() => {
    const p = this.preset;
    return (p.r2 / (p.r1 + p.r2)) * p.vs;
  });

  rth = computed(() => {
    const p = this.preset;
    return (p.r1 * p.r2) / (p.r1 + p.r2);
  });

  /** Effective load impedance for the selected load type */
  zLoad = computed(() => {
    const type = this.loadType();
    const rl   = this.rl();
    const f    = this.freq();
    const lv   = this.l();
    const cv   = this.c() * 1e-6; // µF → F

    if (type === 'resistiva') {
      return { re: rl, im: 0 };
    }
    if (type === 'inductiva') {
      const xl = 2 * Math.PI * f * lv;
      return { re: rl, im: xl };
    }
    // capacitiva
    const xc = 1 / (2 * Math.PI * f * cv);
    return { re: rl, im: -xc };
  });

  /** |Z_load| */
  zMag = computed(() => {
    const z = this.zLoad();
    return Math.sqrt(z.re ** 2 + z.im ** 2);
  });

  /** For DC (resistive) or magnitude-based AC analysis */
  iLoad = computed(() => this.vth() / (this.rth() + this.zMag()));
  vLoad = computed(() => this.iLoad() * this.zMag());
  pLoad = computed(() => this.iLoad() ** 2 * this.zLoad().re);

  /** Phase angle of load (degrees) */
  phaseAngle = computed(() => {
    const z = this.zLoad();
    return (Math.atan2(z.im, z.re) * 180) / Math.PI;
  });

  selectPreset(index: number) {
    this.selectedPresetIndex.set(index);
    this.revealed.set(false);
    this.measurements.set([]);
  }

  setLoadType(type: LoadType) {
    this.loadType.set(type);
  }

  measure() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.rl.set(v.rl!);
    this.freq.set(v.freq!);
    this.l.set(v.l!);
    this.c.set(v.c!);

    const row = {
      rl:       this.zMag(),
      vl:       this.vLoad(),
      il:       this.iLoad(),
      pl:       this.pLoad(),
      loadType: this.loadType(),
    };

    this.measurements.update(prev => [row, ...prev].slice(0, 5));
  }

  reveal() {
    this.revealed.set(true);
  }

  fmt(n: number, dec = 3): string {
    return n.toFixed(dec);
  }

  fmtZ(n: number): string {
    return Math.abs(n) >= 1000 ? (n / 1000).toFixed(2) + 'k' : n.toFixed(1);
  }
}
