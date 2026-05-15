import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-potentiometer-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './potentiometer-simulator.component.html',
  styleUrls: ['./potentiometer-simulator.component.scss']
})
export class PotentiometerSimulatorComponent {
  // Parámetros
  totalResistance = signal(10000); // 10kΩ
  position = signal(50); // Posición del cursor (0-100%)
  inputVoltage = signal(12);
  curveType = signal<'linear' | 'logarithmic'>('linear');
  application = signal<'volume' | 'brightness' | 'speed'>('volume');
  
  // Cálculos
  resistance1 = computed(() => {
    const pos = this.position() / 100;
    const total = this.totalResistance();
    
    if (this.curveType() === 'logarithmic') {
      // Curva logarítmica (audio taper)
      return total * Math.pow(pos, 2);
    }
    // Curva lineal
    return total * pos;
  });
  
  resistance2 = computed(() => {
    return this.totalResistance() - this.resistance1();
  });
  
  outputVoltage = computed(() => {
    const r1 = this.resistance1();
    const r2 = this.resistance2();
    const vIn = this.inputVoltage();
    
    if (r1 + r2 === 0) return 0;
    return vIn * (r2 / (r1 + r2));
  });
  
  outputPercentage = computed(() => {
    return (this.outputVoltage() / this.inputVoltage()) * 100;
  });
  
  current = computed(() => {
    const total = this.totalResistance();
    if (total === 0) return 0;
    return (this.inputVoltage() / total) * 1000; // en mA
  });
  
  power = computed(() => {
    return (this.inputVoltage() * this.current()) / 1000; // en W
  });

  getApplicationIcon(): string {
    const icons = {
      volume: '🔊',
      brightness: '💡',
      speed: '⚙️'
    };
    return icons[this.application()];
  }

  getApplicationLabel(): string {
    const labels = {
      volume: 'Volumen',
      brightness: 'Brillo',
      speed: 'Velocidad'
    };
    return labels[this.application()];
  }

  getVisualOutput(): number {
    if (this.curveType() === 'logarithmic') {
      // Para audio, la percepción es logarítmica
      const pos = this.position() / 100;
      return Math.pow(pos, 2) * 100;
    }
    return this.position();
  }
}
