import { Component, computed, signal, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../directives/katex.directive';

interface CircuitPreset {
  id: string;
  name: string;
  description: string;
  vs: number;
  r1: number;
  r2: number;
  r3: number;
}

@Component({
  selector: 'app-protoboard-thevenin-norton',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './protoboard-thevenin-norton.html',
  styleUrl: './protoboard-thevenin-norton.scss'
})
export class ProtoboardTheveninNorton {

  // Template helpers
  readonly Math = Math;
  readonly arr30 = Array(30).fill(0);
  readonly arr5  = Array(5).fill(0);

  hasComponent(section: string, row: number, col: number): boolean {
    return false; // static layout shown via overlay
  }

  isPowered(section: string, col: number): boolean {
    return col < 5;
  }

  isPoweredNeg(section: string, col: number): boolean {
    return col < 5;
  }


  // ── Presets ──────────────────────────────────────────────────────────────
  presets: CircuitPreset[] = [
    { id: 'basico',   name: 'Básico',        description: 'Divisor de voltaje simple',      vs: 12,  r1: 100, r2: 200, r3: 50  },
    { id: 'potencia', name: 'Alta Potencia',  description: 'Fuente con baja impedancia',     vs: 24,  r1: 47,  r2: 100, r3: 22  },
    { id: 'sensor',   name: 'Sensor',         description: 'Circuito de medición típico',    vs: 5,   r1: 10,  r2: 10,  r3: 4.7 },
    { id: 'audio',    name: 'Audio',          description: 'Divisor de entrada de audio',    vs: 9,   r1: 33,  r2: 68,  r3: 10  },
  ];
  selectedPreset = signal<string>('basico');

  applyPreset(preset: CircuitPreset) {
    this.vs.set(preset.vs);
    this.r1.set(preset.r1);
    this.r2.set(preset.r2);
    this.r3.set(preset.r3);
    this.selectedPreset.set(preset.id);
  }

  // ── Input signals ─────────────────────────────────────────────────────────
  vs  = signal(12);
  r1  = signal(100);
  r2  = signal(200);
  r3  = signal(50);
  rl  = signal(100);   // load resistance

  // ── Computed Thevenin / Norton ────────────────────────────────────────────
  vth = computed(() => this.vs() * (this.r2() / (this.r1() + this.r2())));

  rth = computed(() => {
    const r12 = (this.r1() * this.r2()) / (this.r1() + this.r2());
    return r12 + this.r3();
  });

  iNorton  = computed(() => this.vth() / this.rth());

  // With load
  vLoad    = computed(() => this.vth() * this.rl() / (this.rth() + this.rl()));
  iLoad    = computed(() => this.vth() / (this.rth() + this.rl()));
  pLoad    = computed(() => this.iLoad() * this.iLoad() * this.rl());

  // ── KaTeX equations ───────────────────────────────────────────────────────
  vthEq = computed(() =>
    `V_{TH} = V_S\\cdot\\frac{R_2}{R_1+R_2} = ${this.vs()}\\cdot\\frac{${this.r2()}}{${this.r1()}+${this.r2()}} = ${this.vth().toFixed(3)}\\text{ V}`
  );

  rthEq = computed(() => {
    const r12 = (this.r1() * this.r2()) / (this.r1() + this.r2());
    return `R_{TH} = R_3+(R_1\\|R_2) = ${this.r3()}+${r12.toFixed(2)} = ${this.rth().toFixed(3)}\\text{ }\\Omega`;
  });

  inEq = computed(() =>
    `I_N = \\frac{V_{TH}}{R_{TH}} = \\frac{${this.vth().toFixed(3)}}{${this.rth().toFixed(3)}} = ${(this.iNorton()*1000).toFixed(3)}\\text{ mA}`
  );

  vLoadEq = computed(() =>
    `V_L = V_{TH}\\cdot\\frac{R_L}{R_{TH}+R_L} = ${this.vth().toFixed(2)}\\cdot\\frac{${this.rl()}}{${this.rth().toFixed(1)}+${this.rl()}} = ${this.vLoad().toFixed(3)}\\text{ V}`
  );

  // ── UI state ─────────────────────────────────────────────────────────────
  multimeterMode = signal<'VTH' | 'RTH' | 'IN' | 'VL' | 'PL'>('VTH');
  showEquivalent  = signal<'original' | 'thevenin' | 'norton'>('original');
  animateCurrent  = signal(true);

  get multimeterReading(): { value: string; unit: string; label: string } {
    switch (this.multimeterMode()) {
      case 'VTH': return { value: this.vth().toFixed(3),              unit: 'V',  label: 'V_TH Circuito Abierto' };
      case 'RTH': return { value: this.rth().toFixed(3),              unit: 'Ω',  label: 'R_TH Equivalente' };
      case 'IN':  return { value: (this.iNorton()*1000).toFixed(3),  unit: 'mA', label: 'I_N Corto Circuito' };
      case 'VL':  return { value: this.vLoad().toFixed(3),            unit: 'V',  label: 'V_L en Carga' };
      case 'PL':  return { value: (this.pLoad()*1000).toFixed(3),    unit: 'mW', label: 'P_L Potencia en Carga' };
    }
  }

  // ── Resistor color bands ──────────────────────────────────────────────────
  private readonly BAND_COLORS = ['black','brown','red','orange','yellow','green','blue','violet','gray','white'];
  private readonly BAND_HEX    = ['#000','#6B3A2A','#F00','#F80','#FF0','#080','#00F','#8B008B','#808080','#fff'];

  getResistorBands(ohms: number): { color: string; hex: string }[] {
    const v = Math.max(1, Math.round(ohms));
    const digits = v.toString().padStart(3,'0');
    const d1  = parseInt(digits[0]);
    const d2  = parseInt(digits[1]);
    const exp = digits.length - 2;
    const mul = Math.max(0, exp - 1);
    return [
      { color: this.BAND_COLORS[d1],  hex: this.BAND_HEX[d1]  },
      { color: this.BAND_COLORS[d2],  hex: this.BAND_HEX[d2]  },
      { color: this.BAND_COLORS[mul], hex: this.BAND_HEX[mul] },
      { color: 'gold',                hex: '#CFB53B'           },
    ];
  }

  // ── SVG current animation ─────────────────────────────────────────────────
  get currentIntensity(): number {
    return Math.min(1, this.iLoad() / 0.1); // normalize to 0–1
  }
}
