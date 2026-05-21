import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

export type CircuitId = 'divisor' | 'rc_serie' | 'rectificador' | 'emisor_comun';

@Component({
  selector: 'app-circuit-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './circuit-builder.component.html',
  styleUrls: ['./circuit-builder.component.scss']
})
export class CircuitBuilderComponent implements OnInit, OnDestroy {
  activeCircuit = signal<CircuitId>('divisor');

  // General Animation state
  animationTime = signal(0);
  isPlaying = signal(true);
  private animationFrame?: number;

  // 1. Voltage Divider parameters
  divVin = signal(12); // V
  divR1 = signal(1000); // Ω
  divR2 = signal(2000); // Ω

  divVout = computed(() => {
    const r1 = this.divR1();
    const r2 = this.divR2();
    const vin = this.divVin();
    if (r1 + r2 === 0) return 0;
    return (vin * r2) / (r1 + r2);
  });

  // 2. RC Series parameters
  rcVin = signal(5); // V peak
  rcR = signal(1000); // Ω
  rcC = signal(1); // µF
  rcFreq = signal(100); // Hz

  rcXc = computed(() => {
    const f = this.rcFreq();
    const c = this.rcC() * 1e-6;
    if (f === 0 || c === 0) return Infinity;
    return 1 / (2 * Math.PI * f * c);
  });

  rcZ = computed(() => {
    const r = this.rcR();
    const xc = this.rcXc();
    return Math.sqrt(r * r + xc * xc);
  });

  rcPhaseRad = computed(() => {
    const r = this.rcR();
    const xc = this.rcXc();
    return Math.atan(-xc / r);
  });

  rcPhaseDeg = computed(() => {
    return (this.rcPhaseRad() * 180) / Math.PI;
  });

  rcCurrentPeak = computed(() => {
    const z = this.rcZ();
    if (z === 0) return 0;
    return this.rcVin() / z; // Amperes peak
  });

  // 3. Half-Wave Rectifier parameters
  rectVinVal = signal(6); // V peak
  rectFreqVal = signal(60); // Hz
  rectDiodeDrop = signal(0.7); // V

  rectVoutPeak = computed(() => {
    return Math.max(0, this.rectVinVal() - this.rectDiodeDrop());
  });

  rectVoutAvg = computed(() => {
    return this.rectVoutPeak() / Math.PI;
  });

  // 4. Common Emitter BJT parameters
  bjtVcc = signal(12); // V
  bjtRc = signal(2200); // Ω
  bjtRe = signal(1000); // Ω
  bjtRb1 = signal(47000); // Ω
  bjtRb2 = signal(10000); // Ω
  bjtBeta = signal(150);

  bjtQPoint = computed(() => {
    const vcc = this.bjtVcc();
    const rc = this.bjtRc();
    const re = this.bjtRe();
    const rb1 = this.bjtRb1();
    const rb2 = this.bjtRb2();
    const beta = this.bjtBeta();

    // Thevenin equivalent at base
    const vth = (vcc * rb2) / (rb1 + rb2);
    const rth = (rb1 * rb2) / (rb1 + rb2);

    // Base current: Ib = (Vth - Vbe) / (Rth + (beta + 1)*Re)
    // Assuming Vbe = 0.7V
    const vbe = 0.7;
    let ib = (vth - vbe) / (rth + (beta + 1) * re);
    if (ib < 0) ib = 0;

    const ic = ib * beta;
    let vce = vcc - ic * (rc + re);
    if (vce < 0) {
      vce = 0.2; // saturation voltage approx
    }

    // Voltage gain (approximate): Av = -Rc / (re_prime + Re)
    // re_prime ≈ 25mV / Ie
    const ie = ic + ib;
    const re_prime = ie > 0 ? 0.025 / ie : Infinity;
    const gain = re + re_prime > 0 ? -rc / (re_prime + re) : 0;

    return {
      ib: ib * 1e6, // µA
      ic: ic * 1e3, // mA
      vce: vce, // V
      gain: gain
    };
  });

  ngOnInit() {
    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  startAnimation() {
    const animate = () => {
      if (this.isPlaying()) {
        this.animationTime.update(t => (t + 0.05) % (2 * Math.PI));
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  setCircuit(circuit: CircuitId) {
    this.activeCircuit.set(circuit);
  }

  generateWavePath(type: 'vin' | 'vout'): string {
    const points: string[] = [];
    const samples = 100;
    const width = 300;
    const height = 100;
    const centerY = height / 2;
    const t = this.animationTime();

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const normalizedX = (i / samples) * 2 * Math.PI * 2; // 2 full cycles
      let yVal = 0;

      if (this.activeCircuit() === 'rc_serie') {
        const vinPeak = this.rcVin();
        if (type === 'vin') {
          yVal = vinPeak * Math.sin(normalizedX - t);
        } else {
          // Output is capacitor voltage: Vc peak = I peak * Xc
          // Phase shift: current leads voltage by theta, capacitor voltage lags current by 90deg (so lags Vin by 90 - theta)
          const vcPeak = this.rcCurrentPeak() * this.rcXc();
          const phaseLag = -this.rcPhaseRad() - Math.PI/2; // angle offset
          yVal = vcPeak * Math.sin(normalizedX - t + phaseLag);
        }
        // Scale for rendering (max range approx 5V)
        yVal = yVal * 8; 
      } else if (this.activeCircuit() === 'rectificador') {
        const vinPeak = this.rectVinVal();
        const drop = this.rectDiodeDrop();
        if (type === 'vin') {
          yVal = vinPeak * Math.sin(normalizedX - t);
        } else {
          const vin = vinPeak * Math.sin(normalizedX - t);
          yVal = vin > drop ? vin - drop : 0;
        }
        // Scale for rendering (max range approx 6V)
        yVal = yVal * 7;
      } else if (this.activeCircuit() === 'divisor') {
        const vin = this.divVin();
        if (type === 'vin') {
          yVal = vin / 2; // steady DC representation
        } else {
          yVal = this.divVout() / 2;
        }
        // center line reference adjustment
      }

      let scaledY = centerY - yVal;
      if (this.activeCircuit() === 'divisor') {
        // DC representation: horizontal line
        scaledY = centerY - (type === 'vin' ? this.divVin() * 3.5 : this.divVout() * 3.5);
      }

      if (i === 0) {
        points.push(`M ${x} ${scaledY}`);
      } else {
        points.push(`L ${x} ${scaledY}`);
      }
    }

    return points.join(' ');
  }
}
