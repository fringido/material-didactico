import { Component, AfterViewInit, ElementRef, ViewChild, OnChanges, OnDestroy, SimpleChanges, signal, computed, PLATFORM_ID, inject, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

export type FilterType = 'lowpass' | 'highpass' | 'bandpass';

@Component({
  selector: 'app-bode-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './bode-chart.component.html',
  styleUrls: ['./bode-chart.component.scss']
})
export class BodeChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @Input() set type(value: FilterType) { this.filterType.set(value); }
  @Input() set R(value: number) { this.rValue.set(value); }
  @Input() set C(value: number) { this.cValue.set(value); }
  @Input() set L(value: number) { this.lValue.set(value); }

  filterType = signal<FilterType>('lowpass');

  // Component Values
  rValue = signal(1000);  // Ω
  cValue = signal(1);     // µF (1e-6 F)
  lValue = signal(100);   // mH (1e-3 H) - used in bandpass

  @ViewChild('magnitudeChart') magCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('phaseChart') phaseCanvasRef!: ElementRef<HTMLCanvasElement>;

  private resizeObserver: ResizeObserver | null = null;

  // Calculated values
  cutoffFreq = computed(() => {
    const type = this.filterType();
    const r = this.rValue();
    const c = this.cValue() * 1e-6;
    const l = this.lValue() * 1e-3;

    if (type === 'lowpass' || type === 'highpass') {
      if (r === 0 || c === 0) return 0;
      return 1 / (2 * Math.PI * r * c); // Hz
    } else {
      // Bandpass RLC resonance freq: f0 = 1 / (2*pi*sqrt(L*C))
      if (l === 0 || c === 0) return 0;
      return 1 / (2 * Math.PI * Math.sqrt(l * c)); // Hz
    }
  });

  qFactor = computed(() => {
    const type = this.filterType();
    if (type !== 'bandpass') return 0;
    const r = this.rValue();
    const c = this.cValue() * 1e-6;
    const l = this.lValue() * 1e-3;
    if (r === 0 || c === 0 || l === 0) return 0;
    // RLC series Q = (1/R) * sqrt(L/C)
    return (1 / r) * Math.sqrt(l / c);
  });

  bandwidth = computed(() => {
    const type = this.filterType();
    if (type !== 'bandpass') return 0;
    const f0 = this.cutoffFreq();
    const q = this.qFactor();
    if (q === 0) return 0;
    return f0 / q; // Hz
  });

  getTransferFunctionEquation(): string {
    const type = this.filterType();
    if (type === 'lowpass') {
      return 'H(j\\omega) = \\frac{1}{1 + j\\omega RC} = \\frac{1}{1 + j\\frac{f}{f_c}}';
    } else if (type === 'highpass') {
      return 'H(j\\omega) = \\frac{j\\omega RC}{1 + j\\omega RC} = \\frac{j\\frac{f}{f_c}}{1 + j\\frac{f}{f_c}}';
    } else {
      return 'H(j\\omega) = \\frac{j\\omega RC}{(j\\omega)^2 LC + j\\omega RC + 1}';
    }
  }

  getTransferFunctionData(freq: number): { magDb: number; phaseDeg: number } {
    const type = this.filterType();
    const w = 2 * Math.PI * freq;
    const r = this.rValue();
    const c = this.cValue() * 1e-6;
    const l = this.lValue() * 1e-3;

    if (type === 'lowpass') {
      // H(jw) = 1 / (1 + jwRC)
      const denomReal = 1;
      const denomImag = w * r * c;
      const denomMag = Math.sqrt(denomReal * denomReal + denomImag * denomImag);
      const mag = 1 / denomMag;
      const magDb = 20 * Math.log10(mag);
      const phaseDeg = -Math.atan2(denomImag, denomReal) * (180 / Math.PI);
      return { magDb, phaseDeg };
    } else if (type === 'highpass') {
      // H(jw) = jwRC / (1 + jwRC)
      const numReal = 0;
      const numImag = w * r * c;
      const denomReal = 1;
      const denomImag = w * r * c;

      const numMag = numImag;
      const denomMag = Math.sqrt(denomReal * denomReal + denomImag * denomImag);
      const mag = numMag / denomMag;
      const magDb = 20 * Math.log10(mag);

      const numAngle = Math.PI / 2;
      const denomAngle = Math.atan2(denomImag, denomReal);
      const phaseDeg = (numAngle - denomAngle) * (180 / Math.PI);
      return { magDb, phaseDeg };
    } else {
      // Series RLC Bandpass: Vout is across R.
      // H(jw) = jwRC / (-w^2*L*C + jwRC + 1)
      const numReal = 0;
      const numImag = w * r * c;
      const denomReal = 1 - w * w * l * c;
      const denomImag = w * r * c;

      const numMag = numImag;
      const denomMag = Math.sqrt(denomReal * denomReal + denomImag * denomImag);
      const mag = denomMag > 0 ? numMag / denomMag : 0;
      // Avoid log10(0)
      const magDb = mag > 0 ? 20 * Math.log10(mag) : -100;

      const numAngle = Math.PI / 2;
      const denomAngle = Math.atan2(denomImag, denomReal);
      const phaseDeg = (numAngle - denomAngle) * (180 / Math.PI);
      return { magDb, phaseDeg };
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.draw();
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (Object.keys(changes).length) {
      this.draw();
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  setFilterType(type: FilterType) {
    this.filterType.set(type);
    this.draw();
  }

  onParamChange() {
    this.draw();
  }

  draw() {
    if (!isPlatformBrowser(this.platformId)) return;

    const magCanvas = this.magCanvasRef?.nativeElement;
    const phaseCanvas = this.phaseCanvasRef?.nativeElement;
    if (!magCanvas || !phaseCanvas) return;

    this.drawChart(magCanvas, 'magnitude');
    this.drawChart(phaseCanvas, 'phase');
  }

  private setupResizeObserver() {
    const canvasRoot = this.magCanvasRef?.nativeElement?.parentElement;
    if (!canvasRoot || !window.ResizeObserver) return;

    this.resizeObserver = new ResizeObserver(() => this.draw());
    this.resizeObserver.observe(canvasRoot);
    this.resizeObserver.observe(this.phaseCanvasRef.nativeElement.parentElement || this.phaseCanvasRef.nativeElement);
  }

  drawChart(canvas: HTMLCanvasElement, mode: 'magnitude' | 'phase') {
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
    const PAD = { top: 15, right: 25, bottom: 30, left: 50 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Range: 10 Hz to 100 kHz (4 decades: 10^1 to 10^5)
    const minDec = 1;
    const maxDec = 5;
    const minFreq = Math.pow(10, minDec);
    const maxFreq = Math.pow(10, maxDec);

    // X-axis log scale conversion helper
    const getX = (f: number) => {
      const logVal = Math.log10(f);
      const ratio = (logVal - minDec) / (maxDec - minDec);
      return PAD.left + ratio * plotW;
    };

    // Draw logarithmic grid lines (X axis)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let dec = minDec; dec < maxDec; dec++) {
      const baseFreq = Math.pow(10, dec);
      for (let i = 1; i <= 9; i++) {
        const freqVal = baseFreq * i;
        const x = getX(freqVal);
        ctx.beginPath();
        ctx.moveTo(x, PAD.top);
        ctx.lineTo(x, PAD.top + plotH);
        // Style main decade divisions slightly brighter
        ctx.strokeStyle = i === 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)';
        ctx.stroke();
      }
    }

    // Y-axis details based on mode
    let minY = 0;
    let maxY = 0;
    let yLabels: string[] = [];

    if (mode === 'magnitude') {
      minY = -60; // dB
      maxY = 10;  // dB
      yLabels = ['10 dB', '0 dB', '-10 dB', '-20 dB', '-30 dB', '-40 dB', '-50 dB', '-60 dB'];
    } else {
      minY = -95; // Degrees
      maxY = 95;  // Degrees
      yLabels = ['90°', '45°', '0°', '-45°', '-90°'];
    }

    const getY = (val: number) => {
      const ratio = (val - minY) / (maxY - minY);
      return PAD.top + plotH - ratio * plotH;
    };

    // Draw Y-axis grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    yLabels.forEach((label) => {
      let numVal = 0;
      if (mode === 'magnitude') {
        numVal = parseInt(label.replace(' dB', ''));
      } else {
        numVal = parseInt(label.replace('°', ''));
      }
      const y = getY(numVal);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + plotW, y);
      ctx.strokeStyle = numVal === 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)';
      ctx.stroke();
    });

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + plotH);
    ctx.moveTo(PAD.left, PAD.top + plotH);
    ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
    ctx.stroke();

    // Axis values labels (X-axis frequencies)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (let dec = minDec; dec <= maxDec; dec++) {
      const freqVal = Math.pow(10, dec);
      const x = getX(freqVal);
      const text = freqVal < 1000 ? freqVal + ' Hz' : (freqVal / 1000) + ' kHz';
      ctx.fillText(text, x, PAD.top + plotH + 14);
    }

    // Axis values labels (Y-axis)
    ctx.textAlign = 'right';
    yLabels.forEach((label) => {
      let numVal = 0;
      if (mode === 'magnitude') {
        numVal = parseInt(label.replace(' dB', ''));
      } else {
        numVal = parseInt(label.replace('°', ''));
      }
      const y = getY(numVal);
      ctx.fillText(label, PAD.left - 6, y + 3);
    });

    // Plot values curve
    const pointsCount = 150;
    const curvePoints: { x: number; y: number }[] = [];

    for (let i = 0; i <= pointsCount; i++) {
      const logFreq = minDec + (i / pointsCount) * (maxDec - minDec);
      const freq = Math.pow(10, logFreq);
      const data = this.getTransferFunctionData(freq);

      const x = getX(freq);
      const y = getY(mode === 'magnitude' ? data.magDb : data.phaseDeg);

      // Clamp y within drawing area visually or skip drawing if it's off scale
      if (y >= PAD.top && y <= PAD.top + plotH) {
        curvePoints.push({ x, y });
      } else if (y < PAD.top) {
        curvePoints.push({ x, y: PAD.top });
      } else {
        curvePoints.push({ x, y: PAD.top + plotH });
      }
    }

    if (curvePoints.length > 0) {
      // Draw Gradient fill below curve (only for magnitude)
      if (mode === 'magnitude') {
        const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
        grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(curvePoints[0].x, PAD.top + plotH);
        curvePoints.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(curvePoints[curvePoints.length - 1].x, PAD.top + plotH);
        ctx.closePath();
        ctx.fill();
      }

      // Draw curve line
      ctx.strokeStyle = mode === 'magnitude' ? '#8B5CF6' : '#FB923C';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      for (let i = 1; i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
      }
      ctx.stroke();
    }

    // Draw Cutoff frequency dotted indicator
    const fc = this.cutoffFreq();
    if (fc >= minFreq && fc <= maxFreq) {
      const fcX = getX(fc);
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(fcX, PAD.top);
      ctx.lineTo(fcX, PAD.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Label at fc intersection
      const fcData = this.getTransferFunctionData(fc);
      const fcY = getY(mode === 'magnitude' ? fcData.magDb : fcData.phaseDeg);

      ctx.fillStyle = '#34D399';
      ctx.beginPath();
      ctx.arc(fcX, fcY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Text label for frequency cutoff
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`fc = ${fc.toFixed(1)} Hz`, fcX + 8, fcY - 6);
    }
  }
}
