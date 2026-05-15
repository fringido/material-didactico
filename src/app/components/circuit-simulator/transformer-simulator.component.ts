import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-transformer-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './transformer-simulator.component.html',
  styleUrls: ['./transformer-simulator.component.scss']
})
export class TransformerSimulatorComponent {
  // Parámetros del transformador
  primaryTurns = signal(100);
  secondaryTurns = signal(200);
  primaryVoltage = signal(120);
  load = signal(100); // Resistencia de carga en Ohms
  
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
        this.animationTime.update(t => (t + 0.05) % (2 * Math.PI));
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  // Cálculos
  turnsRatio = computed(() => this.primaryTurns() / this.secondaryTurns());
  
  secondaryVoltage = computed(() => {
    return this.primaryVoltage() * (this.secondaryTurns() / this.primaryTurns());
  });
  
  secondaryCurrent = computed(() => {
    return this.secondaryVoltage() / this.load();
  });
  
  primaryCurrent = computed(() => {
    return this.secondaryCurrent() * (this.secondaryTurns() / this.primaryTurns());
  });
  
  primaryPower = computed(() => {
    return this.primaryVoltage() * this.primaryCurrent();
  });
  
  secondaryPower = computed(() => {
    return this.secondaryVoltage() * this.secondaryCurrent();
  });
  
  efficiency = computed(() => {
    const pIn = this.primaryPower();
    const pOut = this.secondaryPower();
    return pIn > 0 ? (pOut / pIn) * 100 : 0;
  });
  
  transformerType = computed(() => {
    const ratio = this.secondaryTurns() / this.primaryTurns();
    if (ratio > 1) return 'Elevador';
    if (ratio < 1) return 'Reductor';
    return 'Aislamiento';
  });

  // Visualización del flujo magnético
  getMagneticFluxIntensity(): number {
    const t = this.animationTime();
    return Math.abs(Math.sin(t));
  }

  generatePrimaryWave(): string {
    const points: string[] = [];
    const samples = 100;
    const width = 200;
    const height = 60;
    const t = this.animationTime();

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const phase = (i / samples) * 2 * Math.PI + t;
      const y = Math.sin(phase) * 20;
      const scaledY = height / 2 - y;
      
      if (i === 0) {
        points.push(`M ${x} ${scaledY}`);
      } else {
        points.push(`L ${x} ${scaledY}`);
      }
    }
    
    return points.join(' ');
  }

  generateSecondaryWave(): string {
    const points: string[] = [];
    const samples = 100;
    const width = 200;
    const height = 60;
    const t = this.animationTime();
    const voltageRatio = this.secondaryVoltage() / this.primaryVoltage();

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const phase = (i / samples) * 2 * Math.PI + t;
      const y = Math.sin(phase) * 20 * voltageRatio;
      const scaledY = height / 2 - y;
      
      if (i === 0) {
        points.push(`M ${x} ${scaledY}`);
      } else {
        points.push(`L ${x} ${scaledY}`);
      }
    }
    
    return points.join(' ');
  }
}
