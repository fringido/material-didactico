import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-amplifier-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './amplifier-simulator.component.html',
  styleUrls: ['./amplifier-simulator.component.scss']
})
export class AmplifierSimulatorComponent implements OnInit {
  // Parámetros de entrada
  inputVoltage = signal(1.0);
  gain = signal(10);
  frequency = signal(1);
  configuration = signal<'emisor_comun' | 'colector_comun' | 'base_comun'>('emisor_comun');
  
  // Parámetros calculados
  outputVoltage = computed(() => {
    const config = this.configuration();
    if (config === 'colector_comun') return this.inputVoltage() * 0.95;
    if (config === 'base_comun') return this.inputVoltage() * this.gain();
    return this.inputVoltage() * this.gain(); // emisor_comun
  });
  
  phaseShift = computed(() => {
    return this.configuration() === 'emisor_comun' ? 180 : 0;
  });
  
  powerGain = computed(() => {
    const vGain = this.outputVoltage() / this.inputVoltage();
    return 10 * Math.log10(vGain * vGain);
  });

  // Animación
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
        this.animationTime.update(t => (t + 0.02) % (2 * Math.PI));
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  getInputWaveY(x: number): number {
    const t = this.animationTime();
    const freq = this.frequency();
    return this.inputVoltage() * Math.sin(freq * x + t);
  }

  getOutputWaveY(x: number): number {
    const t = this.animationTime();
    const freq = this.frequency();
    const phase = this.phaseShift() * Math.PI / 180;
    return this.outputVoltage() * Math.sin(freq * x + t + phase);
  }

  generateWavePath(isInput: boolean): string {
    const points: string[] = [];
    const samples = 100;
    const width = 300;
    const height = 80;
    
    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const normalizedX = (i / samples) * 2 * Math.PI;
      const y = isInput ? this.getInputWaveY(normalizedX) : this.getOutputWaveY(normalizedX);
      const scaledY = height / 2 - (y * 20);
      
      if (i === 0) {
        points.push(`M ${x} ${scaledY}`);
      } else {
        points.push(`L ${x} ${scaledY}`);
      }
    }
    
    return points.join(' ');
  }

  getConfigInfo() {
    const configs = {
      emisor_comun: {
        nombre: 'Emisor Común',
        ganancia_v: 'Alta',
        ganancia_i: 'Alta',
        impedancia_in: 'Media',
        impedancia_out: 'Alta',
        fase: '180°'
      },
      colector_comun: {
        nombre: 'Colector Común',
        ganancia_v: '≈ 1',
        ganancia_i: 'Alta',
        impedancia_in: 'Muy Alta',
        impedancia_out: 'Baja',
        fase: '0°'
      },
      base_comun: {
        nombre: 'Base Común',
        ganancia_v: 'Alta',
        ganancia_i: '≈ 1',
        impedancia_in: 'Baja',
        impedancia_out: 'Alta',
        fase: '0°'
      }
    };
    return configs[this.configuration()];
  }
}
