import { Component, Input, AfterViewInit, ElementRef, ViewChild, OnChanges, SimpleChanges, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { KatexDirective } from '../../directives/katex.directive';

export type ChartType = 'ohm' | 'capacitor_diff' | 'inductor_diff' | 'capacitor_reactance' | 'inductor_reactance' | 'bjt_gain' | 'opamp_diff' | 'opamp_gain' | 'diode_iv' | 'zener_iv' | 'varactor_cv' | 'photodiode_iv';

@Component({
  selector: 'app-equation-chart',
  standalone: true,
  imports: [CommonModule, KatexDirective],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h4 class="chart-title">{{ title }}</h4>
        <div class="chart-controls" *ngIf="hasControls">
          <div class="control-group" *ngIf="chartType === 'ohm'">
            <label>R = <strong>{{ rValue }}</strong> Ω</label>
            <input type="range" min="10" max="1000" [value]="rValue" (input)="onRChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'capacitor_reactance'">
            <label>C = <strong>{{ cValue }}</strong> µF</label>
            <input type="range" min="1" max="100" [value]="cValue" (input)="onCChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'inductor_reactance'">
            <label>L = <strong>{{ lValue }}</strong> mH</label>
            <input type="range" min="1" max="500" [value]="lValue" (input)="onLChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'bjt_gain'">
            <label>β = <strong>{{ betaValue }}</strong></label>
            <input type="range" min="10" max="500" [value]="betaValue" (input)="onBetaChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'opamp_gain'">
            <label>Rf = <strong>{{ rfValue }}</strong> kΩ</label>
            <input type="range" min="1" max="100" [value]="rfValue" (input)="onRfChange($event)" class="slider">
            <label>Rin = <strong>{{ rinValue }}</strong> kΩ</label>
            <input type="range" min="1" max="50" [value]="rinValue" (input)="onRinChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'capacitor_diff'">
            <label>C = <strong>{{ cValue }}</strong> µF</label>
            <input type="range" min="1" max="100" [value]="cValue" (input)="onCChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'inductor_diff'">
            <label>L = <strong>{{ lValue }}</strong> mH</label>
            <input type="range" min="1" max="500" [value]="lValue" (input)="onLChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'opamp_diff'">
            <label>A_{{ '{OL}' }} = <strong>{{ aolValue }}</strong> k</label>
            <input type="range" min="1" max="500" [value]="aolValue" (input)="onAolChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'zener_iv'">
            <label>Vz = <strong>{{ vzValue }}</strong> V</label>
            <input type="range" min="2" max="12" step="0.5" [value]="vzValue" (input)="onVzChange($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'varactor_cv'">
            <label>C₀ = <strong>{{ c0Value }}</strong> pF</label>
            <input type="range" min="10" max="100" [value]="c0Value" (input)="onC0Change($event)" class="slider">
          </div>
          <div class="control-group" *ngIf="chartType === 'photodiode_iv'">
            <label>R_λ = <strong>{{ respValue }}</strong> A/W</label>
            <input type="range" min="0.1" max="1" step="0.1" [value]="respValue" (input)="onRespChange($event)" class="slider">
          </div>
        </div>
      </div>
      <canvas #chart class="chart-canvas"></canvas>
      <div class="chart-equation" [appKatex]="equation"></div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: #0d1117;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      overflow: hidden;
    }
    .chart-header {
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .chart-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      margin-bottom: 10px;
    }
    .chart-controls {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .control-group {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.5);

      strong { color: #7c6af7; }
    }
    .slider {
      flex: 1;
      max-width: 160px;
      height: 4px;
      accent-color: #7c6af7;
      cursor: pointer;
    }
    .chart-canvas {
      display: block;
      width: 100%;
      height: 200px;
    }
    .chart-equation {
      padding: 10px 20px;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      color: #f0c040;
      background: rgba(0,0,0,0.2);
      text-align: center;
      letter-spacing: 1px;
    }
  `]
})
export class EquationChartComponent implements AfterViewInit, OnChanges {
  @Input() chartType: ChartType = 'ohm';
  @Input() title = '';
  @Input() equation = '';
  @ViewChild('chart') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);

  rValue = 100;
  cValue = 10;
  lValue = 100;
  betaValue = 100;
  rfValue = 10;
  rinValue = 1;
  aolValue = 100;
  vzValue = 5.1;
  c0Value = 30;
  respValue = 0.5;

  get hasControls() {
    return ['ohm', 'capacitor_diff', 'inductor_diff', 'capacitor_reactance', 'inductor_reactance', 'bjt_gain', 'opamp_diff', 'opamp_gain', 'zener_iv', 'varactor_cv', 'photodiode_iv'].includes(this.chartType);
  }

  onRChange(e: Event) { this.rValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onCChange(e: Event) { this.cValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onLChange(e: Event) { this.lValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onBetaChange(e: Event) { this.betaValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onRfChange(e: Event) { this.rfValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onRinChange(e: Event) { this.rinValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onAolChange(e: Event) { this.aolValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onVzChange(e: Event) { this.vzValue = +(e.target as HTMLInputElement).value; this.draw(); }
  onC0Change(e: Event) { this.c0Value = +(e.target as HTMLInputElement).value; this.draw(); }
  onRespChange(e: Event) { this.respValue = +(e.target as HTMLInputElement).value; this.draw(); }

  ngAfterViewInit() { if (isPlatformBrowser(this.platformId)) this.draw(); }
  ngOnChanges(c: SimpleChanges) { if (c['chartType'] && this.canvasRef) this.draw(); }

  draw() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const PAD = { top: 16, right: 20, bottom: 28, left: 46 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + plotW, y); ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = PAD.left + (plotW / 6) * i;
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + plotH); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + plotH);
    ctx.moveTo(PAD.left, PAD.top + plotH); ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    const draw = (getData: () => { xs: number[], ys: number[], xLabel: string, yLabel: string, color?: string, color2?: string, ys2?: number[] }) => {
      const { xs, ys, xLabel, yLabel, color = '#7c6af7', color2, ys2 } = getData();
      if (!xs.length) return;

      const maxY = Math.max(...ys, ...(ys2 || [0])) * 1.05 || 1;
      const minY = 0;
      const maxX = xs[xs.length - 1];

      // Y-axis labels
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = maxY - (maxY / 4) * i;
        const y = PAD.top + (plotH / 4) * i;
        const text = val < 10 ? val.toFixed(1) : val < 1000 ? val.toFixed(0) : (val / 1000).toFixed(1) + 'k';
        ctx.fillText(text, PAD.left - 4, y + 3);
      }

      // X-axis labels
      ctx.textAlign = 'center';
      for (let i = 0; i <= 6; i++) {
        const val = (maxX / 6) * i;
        const x = PAD.left + (plotW / 6) * i;
        const text = val < 10 ? val.toFixed(1) : val < 1000 ? val.toFixed(0) : (val / 1000).toFixed(0) + 'k';
        ctx.fillText(text, x, PAD.top + plotH + 16);
      }

      // Axis titles
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(xLabel, PAD.left + plotW / 2, H - 2);
      ctx.save(); ctx.translate(10, PAD.top + plotH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0); ctx.restore();

      const toX = (v: number) => PAD.left + (v / maxX) * plotW;
      const toY = (v: number) => PAD.top + plotH - ((v - minY) / (maxY - minY)) * plotH;

      // Fill area
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
      grad.addColorStop(0, color + '33');
      grad.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.moveTo(toX(xs[0]), PAD.top + plotH);
      xs.forEach((x, i) => ctx.lineTo(toX(x), toY(ys[i])));
      ctx.lineTo(toX(xs[xs.length - 1]), PAD.top + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      xs.forEach((x, i) => i === 0 ? ctx.moveTo(toX(x), toY(ys[i])) : ctx.lineTo(toX(x), toY(ys[i])));
      ctx.stroke();

      // Second line (optional)
      if (ys2 && color2) {
        const grad2 = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
        grad2.addColorStop(0, color2 + '33'); grad2.addColorStop(1, color2 + '00');
        ctx.beginPath();
        ctx.moveTo(toX(xs[0]), PAD.top + plotH);
        xs.forEach((x, i) => ctx.lineTo(toX(x), toY(ys2[i])));
        ctx.lineTo(toX(xs[xs.length - 1]), PAD.top + plotH);
        ctx.closePath();
        ctx.fillStyle = grad2; ctx.fill();
        ctx.strokeStyle = color2; ctx.lineWidth = 2;
        ctx.beginPath();
        xs.forEach((x, i) => i === 0 ? ctx.moveTo(toX(x), toY(ys2[i])) : ctx.lineTo(toX(x), toY(ys2[i])));
        ctx.stroke();
      }
    };

    const N = 60;
    switch (this.chartType) {
      case 'ohm': {
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 2); // 0 to 2A
        draw(() => ({
          xs, ys: xs.map(i => i * this.rValue),
          xLabel: 'Corriente I (A)', yLabel: 'Voltaje V (V)', color: '#7c6af7'
        }));
        break;
      }
      case 'capacitor_reactance': {
        const xs = Array.from({ length: N }, (_, i) => (i + 1) * 200); // 200 Hz to 12kHz
        const C = this.cValue * 1e-6;
        draw(() => ({
          xs, ys: xs.map(f => 1 / (2 * Math.PI * f * C)),
          xLabel: 'Frecuencia f (Hz)', yLabel: 'Xc (Ω)', color: '#f05a7e'
        }));
        break;
      }
      case 'inductor_reactance': {
        const xs = Array.from({ length: N }, (_, i) => (i + 1) * 200);
        const L = this.lValue * 1e-3;
        draw(() => ({
          xs, ys: xs.map(f => 2 * Math.PI * f * L),
          xLabel: 'Frecuencia f (Hz)', yLabel: 'XL (Ω)', color: '#20c997'
        }));
        break;
      }
      case 'bjt_gain': {
        const xs = Array.from({ length: N }, (_, i) => i * 2); // Ib 0..100 µA
        draw(() => ({
          xs, ys: xs.map(ib => ib * this.betaValue),
          xLabel: 'Corriente IB (µA)', yLabel: 'IC (µA)', color: '#f0c040'
        }));
        break;
      }
      case 'capacitor_diff': {
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 1000); // dv/dt in V/s
        const C = this.cValue * 1e-6;
        draw(() => ({
          xs, ys: xs.map(dv => dv * C * 1000), // I in mA
          xLabel: 'dv/dt (V/s)', yLabel: 'I (mA)', color: '#f05a7e'
        }));
        break;
      }
      case 'inductor_diff': {
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 100); // di/dt in A/s
        const L = this.lValue * 1e-3;
        draw(() => ({
          xs, ys: xs.map(di => di * L), // V in Volts
          xLabel: 'di/dt (A/s)', yLabel: 'V (Voltios)', color: '#20c997'
        }));
        break;
      }
      case 'opamp_diff': {
        const xs = Array.from({ length: N }, (_, i) => -5 + (i / (N - 1)) * 10); // Vin_diff in mV
        const Aol = this.aolValue * 1000;
        draw(() => ({
          xs, ys: xs.map(vin => Math.max(-15, Math.min(15, (vin / 1000) * Aol))), // Vout saturated at +-15V
          xLabel: 'V+ - V- (mV)', yLabel: 'Vout (V)', color: '#4da6ff'
        }));
        break;
      }
      case 'zener_iv': {
        const xs = Array.from({ length: N }, (_, i) => -this.vzValue - 2 + (i / (N - 1)) * (this.vzValue + 3)); // V from -Vz-2 to 1
        const IS = 1e-12, VT = 0.02585;
        draw(() => ({
          xs, ys: xs.map(v => {
            if (v > 0) return Math.min(IS * (Math.exp(v / VT) - 1), 200); // Directa
            if (v < -this.vzValue) return Math.max(-200, -10 * (-v - this.vzValue)); // Ruptura (linealizada por simplicidad)
            return 0; // Bloqueo
          }),
          xLabel: 'Voltaje (V)', yLabel: 'Corriente (mA)', color: '#f05a7e'
        }));
        break;
      }
      case 'varactor_cv': {
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 10); // Vr from 0 to 10V
        draw(() => ({
          xs, ys: xs.map(vr => this.c0Value / Math.pow(1 + vr / 0.7, 0.5)),
          xLabel: 'Voltaje Inverso Vr (V)', yLabel: 'Cj (pF)', color: '#20c997'
        }));
        break;
      }
      case 'photodiode_iv': {
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 10); // P_opt from 0 to 10 mW
        draw(() => ({
          xs, ys: xs.map(p => p * this.respValue), // I in mA
          xLabel: 'Potencia Óptica (mW)', yLabel: 'Fotocorriente (mA)', color: '#f0c040'
        }));
        break;
      }
      case 'opamp_gain': {
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 1); // Vin 0..1V
        const gain = this.rfValue / this.rinValue;
        draw(() => ({
          xs, ys: xs.map(v => v * gain),
          xLabel: 'Vin (V)', yLabel: '|Vout| (V)', color: '#4da6ff'
        }));
        break;
      }
      case 'diode_iv': {
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * 1.2); // 0..1.2V
        const IS = 1e-12, VT = 0.02585;
        draw(() => ({
          xs, ys: xs.map(v => Math.min(IS * (Math.exp(v / VT) - 1), 200)),
          xLabel: 'Voltaje V (V)', yLabel: 'Corriente I (mA)', color: '#f05a7e'
        }));
        break;
      }
    }
  }
}
