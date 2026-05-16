import { Component, computed, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

type AmpMode = 'inverter' | 'non-inverter' | 'summing';

@Component({
  selector: 'app-amplifier-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './amplifier-lab.component.html',
  styleUrls: ['./amplifier-lab.component.scss']
})
export class AmplifierLabComponent {
  @Input() data: any;
  @Input() showHeader: boolean = true;

  // State
  mode = signal<AmpMode>('inverter');
  
  // Resistance parameters
  rf = signal(10); // kOhms
  r1 = signal(1);  // kOhms (Rin in inverter, R1 in non-inverter, R1 in summing)
  r2 = signal(1);  // kOhms (summing only)
  r3 = signal(1);  // kOhms (summing only)
  
  // Voltage parameters
  v1 = signal(1);  // Volts (Vin in inverter/non-inverter, V1 in summing)
  v2 = signal(0.5); // Volts (summing only)
  v3 = signal(0.2); // Volts (summing only)
  
  // Physics / Calculations
  gain = computed(() => {
    if (this.mode() === 'inverter') {
      return -(this.rf() / this.r1());
    } else if (this.mode() === 'non-inverter') {
      return 1 + (this.rf() / this.r1());
    }
    return 0; // Gain is not a single number for summing
  });

  vout = computed(() => {
    if (this.mode() === 'inverter' || this.mode() === 'non-inverter') {
      return this.v1() * this.gain();
    } else {
      // Summing Amplifier: Vout = -Rf * (V1/R1 + V2/R2 + V3/R3)
      return -this.rf() * (this.v1() / this.r1() + this.v2() / this.r2() + this.v3() / this.r3());
    }
  });

  // Waves for visualization
  getWavePath(isOutput: boolean): string {
    const points = 100;
    const width = 400;
    const height = 150;
    const centerY = height / 2;
    
    let path = `M 0 ${centerY}`;
    
    if (!isOutput) {
      // Show main input (V1)
      const amplitude = this.v1() * 10;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const y = centerY - amplitude * Math.sin((i / points) * 2 * Math.PI * 2);
        path += ` L ${x} ${y}`;
      }
    } else {
      // Show output (Vout)
      // Saturate visually if it's too high
      const amplitude = Math.min(Math.abs(this.vout()) * 10, centerY - 5);
      const phase = (this.mode() === 'inverter' || this.mode() === 'summing') ? Math.PI : 0;
      
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        const y = centerY - amplitude * Math.sin((i / points) * 2 * Math.PI * 2 + phase);
        path += ` L ${x} ${y}`;
      }
    }
    return path;
  }

  setMode(mode: AmpMode) {
    this.mode.set(mode);
  }

  // Info from JSON to be displayed
  info = {
    "tema": "Amplificadores",
    "definicion": "Circuito que aumenta la amplitud de una señal de entrada (voltaje o corriente) utilizando energía de una fuente de alimentación externa.",
    "conceptos_clave": [
      {
        "id": "ganancia",
        "nombre": "Ganancia",
        "simbolo": "A",
        "descripcion": "Relación entre la salida y la entrada.",
        "formula": "A = \\frac{V_{out}}{V_{in}}"
      },
      {
        "id": "ancho_de_banda",
        "nombre": "Ancho de Banda",
        "simbolo": "BW",
        "descripcion": "Rango de frecuencias en el que el amplificador opera de manera eficiente.",
        "formula": "BW = f_H - f_L"
      }
    ],
    "clasificacion_por_clase": [
      { "clase": "A", "eficiencia_max": "25%", "desc": "Conduce 360°. Alta fidelidad, baja eficiencia." },
      { "clase": "B", "eficiencia_max": "78.5%", "desc": "Conduce 180°. Push-Pull, distorsión de cruce." },
      { "clase": "AB", "eficiencia_max": "65%", "desc": "Conduce > 180°. Estándar en audio." },
      { "clase": "C", "eficiencia_max": "90%", "desc": "Conduce < 180°. Alta eficiencia, alta distorsión (RF)." }
    ]
  };
}
