import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shockley-lab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shockley-lab.component.html',
  styleUrls: ['./shockley-lab.component.scss']
})
export class ShockleyLabComponent {
  temperature = signal(300); // Kelvin
  ideality = signal(1.5); // Factor n
  is_pA = signal(1); // Corriente de saturación en pA

  activeTerm = signal('I');

  k = 1.380649e-23; // Constante de Boltzmann (J/K)
  q = 1.60217663e-19; // Carga del electrón (C)

  formulaDetails: Record<string, any> = {
    'I': { title: 'Corriente del Diodo (I)', desc: 'Es la corriente total que atraviesa el diodo. En polarización directa crece exponencialmente, en inversa se limita a la corriente de saturación.', colorClass: 'color-blue' },
    'Is': { title: 'Corriente de Saturación Inversa (Iₛ)', desc: 'Una corriente muy pequeña que fluye cuando el diodo está en polarización inversa (voltaje negativo). Depende fuertemente de la temperatura y del material (Silicio, Germanio).', colorClass: 'color-purple' },
    'e': { title: 'Base Exponencial (e)', desc: 'La constante matemática (aprox. 2.718). Indica que el crecimiento de la corriente es exponencial respecto al voltaje.', colorClass: 'color-gray' },
    'Vd': { title: 'Voltaje del Diodo (V_D)', desc: 'El voltaje aplicado a través de las terminales del diodo. Positivo para polarización directa, negativo para inversa.', colorClass: 'color-emerald' },
    'n': { title: 'Factor de Idealidad (n)', desc: 'Un número entre 1 y 2 que depende del material y del proceso de fabricación. Representa cómo se comporta el diodo frente a un modelo "ideal".', colorClass: 'color-orange' },
    'Vt': { title: 'Voltaje Térmico (V_T)', desc: 'Calculado como V_T = (k·T)/q. A temperatura ambiente (300 K), es aproximadamente 25.85 mV. Muestra cómo la temperatura afecta la energía de los electrones.', colorClass: 'color-red' },
  };

  svgWidth = 600;
  svgHeight = 400;
  xMin = -0.5;
  xMax = 0.8;
  yMin = -5;
  yMax = 50;

  mapX(x: number) { return ((x - this.xMin) / (this.xMax - this.xMin)) * this.svgWidth; }
  mapY(y: number) { return this.svgHeight - ((y - this.yMin) / (this.yMax - this.yMin)) * this.svgHeight; }

  thermalVoltage = computed(() => {
    return ((this.k * this.temperature()) / this.q) * 1000;
  });

  pathData = computed(() => {
    const points: string[] = [];
    const VT = (this.k * this.temperature()) / this.q;
    const isA = this.is_pA() * 1e-12;
    const n = this.ideality();

    for (let v = this.xMin; v <= this.xMax; v += 0.01) {
      const I_A = isA * (Math.exp(v / (n * VT)) - 1);
      const I_mA = I_A * 1000;
      
      if (I_mA > this.yMax * 1.5) {
        points.push(`${this.mapX(v)},${this.mapY(I_mA)}`);
        break; 
      }
      points.push(`${this.mapX(v)},${this.mapY(I_mA)}`);
    }
    return `M ${points.join(' L ')}`;
  });

  onTempChange(e: any) { this.temperature.set(Number(e.target.value)); }
  onIdealityChange(e: any) { this.ideality.set(Number(e.target.value)); }
  onIsChange(e: any) { this.is_pA.set(Number(e.target.value)); }
  
  setActiveTerm(term: string) { this.activeTerm.set(term); }
}
