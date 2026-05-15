import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-filter-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './filter-simulator.component.html',
  styleUrls: ['./filter-simulator.component.scss']
})
export class FilterSimulatorComponent {
  filterType = signal<'lowpass' | 'highpass' | 'bandpass' | 'notch'>('lowpass');
  cutoffFrequency = signal(1000);
  resistance = signal(1000);
  capacitance = signal(0.159);
  
  animationTime = signal(0);
  isPlaying = signal(true);
  
  private animationFrame?: number;

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
        this.animationTime.update(t => (t + 0.03) % (2 * Math.PI));
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  calculatedCutoff = computed(() => {
    return 1 / (2 * Math.PI * this.resistance() * this.capacitance() / 1000);
  });

  getFrequencyResponse(freq: number): number {
    const fc = this.cutoffFrequency();
    const type = this.filterType();
    const ratio = freq / fc;

    switch (type) {
      case 'lowpass':
        return 1 / Math.sqrt(1 + ratio * ratio);
      case 'highpass':
        return ratio / Math.sqrt(1 + ratio * ratio);
      case 'bandpass':
        const Q = 5;
        const bw = fc / Q;
        return 1 / Math.sqrt(1 + Math.pow((freq - fc) / bw, 2));
      case 'notch':
        const Qn = 10;
        const bwn = fc / Qn;
        return Math.sqrt(1 - 1 / (1 + Math.pow((freq - fc) / bwn, 2)));
      default:
        return 1;
    }
  }

  generateFrequencyResponsePath(): string {
    const points: string[] = [];
    const samples = 100;
    const width = 400;
    const height = 150;
    const minFreq = 10;
    const maxFreq = 10000;

    for (let i = 0; i <= samples; i++) {
      const logFreq = minFreq * Math.pow(maxFreq / minFreq, i / samples);
      const response = this.getFrequencyResponse(logFreq);
      
      const x = (i / samples) * width;
      const y = height - (response * height * 0.8) - 10;
      
      if (i === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        points.push(`L ${x} ${y}`);
      }
    }
    
    return points.join(' ');
  }

  generateInputSignal(): string {
    const points: string[] = [];
    const samples = 100;
    const width = 300;
    const height = 80;
    const t = this.animationTime();

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const normalizedX = (i / samples) * 4 * Math.PI;
      
      // Señal compuesta: baja + media + alta frecuencia
      const lowFreq = Math.sin(normalizedX + t);
      const midFreq = 0.5 * Math.sin(3 * normalizedX + t);
      const highFreq = 0.3 * Math.sin(8 * normalizedX + t);
      const y = (lowFreq + midFreq + highFreq) * 15;
      
      const scaledY = height / 2 - y;
      
      if (i === 0) {
        points.push(`M ${x} ${scaledY}`);
      } else {
        points.push(`L ${x} ${scaledY}`);
      }
    }
    
    return points.join(' ');
  }

  generateOutputSignal(): string {
    const points: string[] = [];
    const samples = 100;
    const width = 300;
    const height = 80;
    const t = this.animationTime();
    const type = this.filterType();

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const normalizedX = (i / samples) * 4 * Math.PI;
      
      let y = 0;
      
      if (type === 'lowpass') {
        y = Math.sin(normalizedX + t) * 15;
      } else if (type === 'highpass') {
        y = 0.3 * Math.sin(8 * normalizedX + t) * 15;
      } else if (type === 'bandpass') {
        y = 0.5 * Math.sin(3 * normalizedX + t) * 15;
      } else {
        const lowFreq = Math.sin(normalizedX + t);
        const highFreq = 0.3 * Math.sin(8 * normalizedX + t);
        y = (lowFreq + highFreq) * 15;
      }
      
      const scaledY = height / 2 - y;
      
      if (i === 0) {
        points.push(`M ${x} ${scaledY}`);
      } else {
        points.push(`L ${x} ${scaledY}`);
      }
    }
    
    return points.join(' ');
  }

  getFilterInfo() {
    const filters = {
      lowpass: {
        nombre: 'Pasa-Bajas (LPF)',
        descripcion: 'Permite el paso de frecuencias bajas, atenúa las altas',
        formula: 'H(j\\omega) = \\frac{1}{1 + j\\omega RC}',
        aplicacion: 'Eliminar ruido de alta frecuencia'
      },
      highpass: {
        nombre: 'Pasa-Altas (HPF)',
        descripcion: 'Permite el paso de frecuencias altas, atenúa las bajas',
        formula: 'H(j\\omega) = \\frac{j\\omega RC}{1 + j\\omega RC}',
        aplicacion: 'Eliminar componente DC'
      },
      bandpass: {
        nombre: 'Pasa-Banda (BPF)',
        descripcion: 'Permite solo un rango específico de frecuencias',
        formula: 'H(j\\omega) = \\frac{j\\omega BW}{(j\\omega)^2 + j\\omega BW + \\omega_0^2}',
        aplicacion: 'Sintonización de radio'
      },
      notch: {
        nombre: 'Rechaza-Banda (Notch)',
        descripcion: 'Elimina una frecuencia específica',
        formula: 'H(j\\omega) = \\frac{(j\\omega)^2 + \\omega_0^2}{(j\\omega)^2 + j\\omega BW + \\omega_0^2}',
        aplicacion: 'Eliminar zumbido de 60Hz'
      }
    };
    return filters[this.filterType()];
  }
}
