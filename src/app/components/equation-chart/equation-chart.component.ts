import { Component, Input, AfterViewInit, ElementRef, ViewChild, OnChanges, OnDestroy, SimpleChanges, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { KatexDirective } from '../../directives/katex.directive';

export type ChartType = 'ohm' | 'capacitor_diff' | 'inductor_diff' | 'capacitor_reactance' | 'inductor_reactance' | 'bjt_gain' | 'opamp_diff' | 'opamp_gain' | 'diode_iv' | 'zener_iv' | 'varactor_cv' | 'photodiode_iv' | 'line-chart' | 'bar-chart' | 'visualization' | 'power_transfer';

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
export class EquationChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() chartType: ChartType = 'ohm';
  @Input() title = '';
  @Input() equation = '';
  @Input() parameters: Record<string, any> = {};
  @ViewChild('chart') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private resizeObserver: ResizeObserver | null = null;

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

  private parseNumber(...values: any[]): number {
    for (const value of values) {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }
      const num = Number(value);
      if (!Number.isNaN(num)) {
        return num;
      }
    }
    return 0;
  }

  private rangeFromParam(range: any, fallback: [number, number]): [number, number] {
    if (Array.isArray(range) && range.length >= 2) {
      const [first, second] = range;
      const start = this.parseNumber(first, fallback[0]);
      const end = this.parseNumber(second, fallback[1]);
      return [start, end];
    }
    return fallback;
  }

  private linspace(start: number, end: number, count: number): number[] {
    if (count <= 1) return [start];
    const step = (end - start) / (count - 1);
    return Array.from({ length: count }, (_, i) => start + i * step);
  }

  private normalizeEquation(equation: string): string {
    return equation
      .replace(/\\cdot|\\times|×/g, '*')
      .replace(/\\,/g, '')
      .replace(/\\left|\\right/g, '')
      .replace(/\s+/g, '')
      .replace(/([A-Za-z0-9_]+)²/g, '($1**2)')
      .replace(/\^/g, '**')
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');
  }

  private buildLineChartData() {
    const params = (this.parameters || {}) as any;
    const equation = this.normalizeEquation(this.equation || '');
    const lowerEq = equation.toLowerCase();
    const color = '#7c6af7';
    const color2 = '#f05a7e';

    const [timeMin, timeMax] = this.rangeFromParam(params.rango_tiempo ?? params.rangoTiempo, [0, 2]);
    const [currentMin, currentMax] = this.rangeFromParam(params.rango_corriente ?? params.rango_I ?? params.rangoCorriente, [0, 5]);
    const [resistanceMin, resistanceMax] = this.rangeFromParam(params.rango_R ?? params.rango_resistencia ?? params.rangoR ?? params.rango_RL, [1, 100]);

    if (params.tipo_onda) {
      const amplitude = this.parseNumber(params.amplitud, params.amplitude, 5);
      const frequency = this.parseNumber(params.frecuencia, params.freq, 1);
      const xs = this.linspace(timeMin, timeMax, 100);
      const ys = xs.map((t) => {
        const phase = 2 * Math.PI * frequency * t;
        switch ((params.tipo_onda || '').toString().toLowerCase()) {
          case 'cuadrada': return Math.sign(Math.sin(phase)) * amplitude;
          case 'triangular': return (2 * amplitude / Math.PI) * Math.asin(Math.sin(phase));
          default: return Math.sin(phase) * amplitude;
        }
      });
      return { xs, ys, xLabel: params.eje_x || 'Tiempo (s)', yLabel: params.eje_y || 'Voltaje (V)', color };
    }

    if (lowerEq.includes('p=v*i') || lowerEq.includes('p=v×i') || lowerEq.includes('p=v*i')) {
      const voltage = this.parseNumber(params.voltaje, params.V, 12);
      const xs = this.linspace(currentMin, currentMax, 100);
      const ys = xs.map((i) => voltage * i);
      return { xs, ys, xLabel: params.eje_x || 'Corriente (A)', yLabel: params.eje_y || 'Potencia (W)', color };
    }

    if (lowerEq.includes('e=p*t') || lowerEq.includes('e=p**t')) {
      const power = this.parseNumber(params.potencia, params.P, 10);
      const xs = this.linspace(timeMin, timeMax, 100);
      const ys = xs.map((t) => power * t);
      return { xs, ys, xLabel: params.eje_x || 'Tiempo (s)', yLabel: params.eje_y || 'Energía (J)', color };
    }

    if (lowerEq.includes('v=i*r') || lowerEq.includes('v=r*i')) {
      const resistance = this.parseNumber(params.R, params.resistencia, params.valores_R?.[0], 10);
      const xs = this.linspace(currentMin, currentMax, 100);
      const ys = xs.map((i) => i * resistance);
      if (Array.isArray(params.valores_R) && params.valores_R.length >= 2) {
        const r1 = this.parseNumber(params.valores_R[0], 10);
        const r2 = this.parseNumber(params.valores_R[1], r1);
        const ys2 = xs.map((i) => i * r2);
        return { xs, ys, xLabel: params.eje_x || 'Corriente (A)', yLabel: params.eje_y || 'Voltaje (V)', color, color2, ys2 };
      }
      return { xs, ys, xLabel: params.eje_x || 'Corriente (A)', yLabel: params.eje_y || 'Voltaje (V)', color };
    }

    if (lowerEq.includes('i=v/r') || lowerEq.includes('i=v÷r') || lowerEq.includes('i=v/r_eq') || lowerEq.includes('i_total=v/r_eq')) {
      const voltage = this.parseNumber(params.voltaje, params.V, 12);
      const xs = this.linspace(resistanceMin, resistanceMax, 100);
      const ys = xs.map((r) => voltage / Math.max(0.1, r));
      return { xs, ys, xLabel: params.eje_x || 'Resistencia (Ω)', yLabel: params.eje_y || 'Corriente (A)', color };
    }

    if (lowerEq.includes('p=v**2/r') || lowerEq.includes('p=v²/r') || lowerEq.includes('p=v^2/r')) {
      const voltage = this.parseNumber(params.voltaje, params.V, 12);
      const xs = this.linspace(resistanceMin, resistanceMax, 100);
      const ys = xs.map((r) => (voltage * voltage) / Math.max(0.1, r));
      return { xs, ys, xLabel: params.eje_x || 'Resistencia (Ω)', yLabel: params.eje_y || 'Potencia (W)', color };
    }

    if (lowerEq.includes('v=v_th-i*r_th') || lowerEq.includes('v=vth-i*rth')) {
      const vth = this.parseNumber(params.V_TH, params.Vth, 12);
      const rth = this.parseNumber(params.R_TH, params.Rth, 10);
      const xs = this.linspace(currentMin, currentMax, 100);
      const ys = xs.map((i) => vth - i * rth);
      return { xs, ys, xLabel: params.eje_x || 'Corriente (A)', yLabel: params.eje_y || 'Voltaje (V)', color };
    }

    if (lowerEq.includes('p=(v_th/(r_th+r_l))**2*r_l') || lowerEq.includes('p=(vth/(rth+rl))**2*rl')) {
      const vth = this.parseNumber(params.V_TH, params.Vth, 12);
      const rth = this.parseNumber(params.R_TH, params.Rth, 10);
      const [rlMin, rlMax] = this.rangeFromParam(params.rango_R_L ?? params.rango_RL, [1, 100]);
      const xs = this.linspace(rlMin, rlMax, 100);
      const ys = xs.map((rl) => Math.pow(vth / (rth + rl), 2) * rl);
      return { xs, ys, xLabel: params.eje_x || 'Resistencia de carga (Ω)', yLabel: params.eje_y || 'Potencia (W)', color };
    }

    if (equation) {
      const labels = (params.eje_x || 'x').toString().toLowerCase();
      const xVar = labels.includes('corriente') ? 'I' : labels.includes('resistencia') ? 'R' : labels.includes('tiempo') ? 't' : labels.includes('frecuencia') ? 'f' : 'x';
      const [min, max] = this.rangeFromParam(params.rango || params.rango_x || params.rango_X || (xVar === 'R' ? [1, 100] : [0, 5]), [0, 5]);
      const xs = this.linspace(min, max, 100);
      const constants: Record<string, number> = {
        V: this.parseNumber(params.voltaje, params.V, 12),
        R: this.parseNumber(params.resistencia, params.R, 10),
        P: this.parseNumber(params.potencia, params.P, 10),
        V_TH: this.parseNumber(params.V_TH, params.Vth, 12),
        R_TH: this.parseNumber(params.R_TH, params.Rth, 10),
        RL: this.parseNumber(params.R_L, params.RL, params.rango_R_L?.[0], 10),
        t: this.parseNumber(params.t, 1),
        f: this.parseNumber(params.frecuencia, params.freq, 1),
      };
      const expression = equation.includes('=') ? equation.split('=')[1] : equation;
      try {
        const expr = expression
          .replace(/\bR_eq\b/g, 'R')
          .replace(/\bR_total\b/g, 'R')
          .replace(/\bV_th\b/g, 'V_TH')
          .replace(/\bR_th\b/g, 'R_TH')
          .replace(/\bR_l\b/g, 'RL')
          .replace(/\bI_total\b/g, 'I');
        const f = new Function('x', ...Object.keys(constants), `return ${expr};`);
        const ys = xs.map((x) => {
          const values = Object.values(constants);
          const result = f(x, ...values);
          return typeof result === 'number' && Number.isFinite(result) ? result : 0;
        });
        return { xs, ys, xLabel: params.eje_x || 'x', yLabel: params.eje_y || 'y', color };
      } catch {
        return null;
      }
    }

    return null;
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.draw();
    this.setupResizeObserver();
  }

  ngOnChanges(_: SimpleChanges) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.draw();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private setupResizeObserver() {
    if (!window.ResizeObserver) return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.resizeObserver = new ResizeObserver(() => this.draw());
    this.resizeObserver.observe(canvas);
    this.resizeObserver.observe(canvas.parentElement || canvas);
  }

  draw() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

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

      const allYs = ys.concat(ys2 || []);
      let maxY = Math.max(...allYs, 0);
      let minY = Math.min(...allYs, 0);
      if (Math.abs(maxY - minY) < 1e-3) {
        maxY += 1;
        minY -= 1;
      }
      maxY = maxY * 1.05;
      minY = minY * 1.05;
      const minX = Math.min(...xs, 0);
      const maxX = Math.max(...xs, 0);
      const xRange = maxX - minX || 1;
      const yRange = maxY - minY || 1;

      // Y-axis labels
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = maxY - (yRange / 4) * i;
        const y = PAD.top + (plotH / 4) * i;
        const text = val < 10 ? val.toFixed(1) : val < 1000 ? val.toFixed(0) : (val / 1000).toFixed(1) + 'k';
        ctx.fillText(text, PAD.left - 4, y + 3);
      }

      // X-axis labels
      ctx.textAlign = 'center';
      for (let i = 0; i <= 6; i++) {
        const val = minX + (xRange / 6) * i;
        const x = PAD.left + (plotW / 6) * i;
        const text = val < 10 ? val.toFixed(1) : val < 1000 ? val.toFixed(0) : (val / 1000).toFixed(0) + 'k';
        ctx.fillText(text, x, PAD.top + plotH + 16);
      }

      // Axis titles
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(xLabel, PAD.left + plotW / 2, H - 2);
      ctx.save(); ctx.translate(10, PAD.top + plotH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0); ctx.restore();

      const toX = (v: number) => PAD.left + ((v - minX) / xRange) * plotW;
      const toY = (v: number) => PAD.top + plotH - ((v - minY) / yRange) * plotH;

      // Fill area
      const baselineY = toY(Math.min(Math.max(0, minY), maxY));
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
      grad.addColorStop(0, color + '33');
      grad.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.moveTo(toX(xs[0]), baselineY);
      xs.forEach((x, i) => ctx.lineTo(toX(x), toY(ys[i])));
      ctx.lineTo(toX(xs[xs.length - 1]), baselineY);
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
      case 'line-chart': {
        const lineData = this.buildLineChartData();
        if (lineData) {
          draw(() => lineData);
        } else {
          const xs = Array.from({ length: N }, (_, i) => i);
          draw(() => ({ xs, ys: xs.map(() => 0), xLabel: 'x', yLabel: 'y', color: '#7c6af7' }));
        }
        break;
      }
      case 'bar-chart': {
        const lineData = this.buildLineChartData();
        if (lineData) {
          draw(() => lineData);
        } else {
          const xs = Array.from({ length: N }, (_, i) => i);
          draw(() => ({ xs, ys: xs.map(() => 0), xLabel: 'Categoría', yLabel: 'Valor', color: '#7c6af7' }));
        }
        break;
      }
      case 'visualization': {
        const xs = Array.from({ length: N }, (_, i) => i);
        draw(() => ({ xs, ys: xs.map(() => 0), xLabel: '', yLabel: '', color: '#7c6af7' }));
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
      case 'power_transfer': {
        const p = this.parameters || {};
        const vth = this.parseNumber(p['V_th']?.value, 12);
        const rth = this.parseNumber(p['R_th']?.value, 4);
        const rlMax = this.parseNumber(p['R_L']?.max, 20);
        const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * rlMax);
        draw(() => ({
          xs, ys: xs.map(rl => Math.pow(vth / (rth + rl), 2) * rl),
          xLabel: 'Resistencia de Carga RL (Ω)', yLabel: 'Potencia PL (W)', color: '#7c6af7'
        }));
        break;
      }
    }
  }
}
