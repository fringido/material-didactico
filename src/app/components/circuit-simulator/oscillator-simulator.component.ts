import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-oscillator-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './oscillator-simulator.component.html',
  styleUrls: ['./oscillator-simulator.component.scss']
})
export class OscillatorSimulatorComponent {
  oscillatorType = signal<'rc' | 'wien' | 'colpitts' | 'crystal'>('wien');
  frequency = signal(1000);
  amplitude = signal(5);
  waveform = signal<'sine' | 'square' | 'triangle'>('sine');
  
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
        this.animationTime.update(t => (t + 0.04) % (2 * Math.PI));
      }
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  togglePlay() {
    this.isPlaying.update(v => !v);
  }

  period = computed(() => 1 / this.frequency());
  angularFrequency = computed(() => 2 * Math.PI * this.frequency());

  generateWaveform(): string {
    const points: string[] = [];
    const samples = 200;
    const width = 400;
    const height = 120;
    const t = this.animationTime();
    const amp = this.amplitude();
    const wave = this.waveform();

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * width;
      const phase = (i / samples) * 4 * Math.PI + t;
      
      let y = 0;
      
      if (wave === 'sine') {
        y = amp * Math.sin(phase);
      } else if (wave === 'square') {
        y = amp * Math.sign(Math.sin(phase));
      } else if (wave === 'triangle') {
        const normalized = (phase % (2 * Math.PI)) / (2 * Math.PI);
        y = amp * (4 * Math.abs(normalized - 0.5) - 1);
      }
      
      const scaledY = height / 2 - (y * 8);
      
      if (i === 0) {
        points.push(`M ${x} ${scaledY}`);
      } else {
        points.push(`L ${x} ${scaledY}`);
      }
    }
    
    return points.join(' ');
  }

  generatePhasorDiagram(): { x: number, y: number, angle: number } {
    const t = this.animationTime();
    const radius = 40;
    const angle = t;
    
    return {
      x: 60 + radius * Math.cos(angle),
      y: 60 - radius * Math.sin(angle),
      angle: angle * 180 / Math.PI
    };
  }

  getLoopGain(): number {
    const type = this.oscillatorType();
    // Simulación simplificada de ganancia de lazo
    if (type === 'rc') return 29; // Necesita ganancia de 29 para 3 etapas RC
    if (type === 'wien') return 3; // Necesita ganancia de 3
    if (type === 'colpitts') return 1.5;
    return 1.0; // crystal
  }

  getPhaseShift(): number {
    const type = this.oscillatorType();
    if (type === 'rc') return 360; // 180° red + 180° amplificador
    return 360; // Todos deben cumplir 360° o 0°
  }

  barkhausenCondition1 = computed(() => {
    const gain = this.getLoopGain();
    return gain >= 1;
  });

  barkhausenCondition2 = computed(() => {
    const phase = this.getPhaseShift();
    return phase % 360 === 0;
  });

  getOscillatorInfo() {
    const oscillators = {
      rc: {
        nombre: 'Oscilador RC (Corrimiento de Fase)',
        descripcion: 'Utiliza 3 etapas RC para generar 180° de desfase',
        formula: 'f = \\frac{1}{2\\pi RC\\sqrt{6}}',
        componentes: '3 etapas RC + Amplificador',
        rango: 'Audio (20Hz - 20kHz)',
        estabilidad: 'Media',
        aplicacion: 'Generadores de audio'
      },
      wien: {
        nombre: 'Oscilador de Puente de Wien',
        descripcion: 'Muy estable, utiliza retroalimentación positiva y negativa',
        formula: 'f = \\frac{1}{2\\pi RC}',
        componentes: 'Puente RC + Op-Amp',
        rango: 'Audio a RF baja',
        estabilidad: 'Muy Alta',
        aplicacion: 'Generadores de precisión'
      },
      colpitts: {
        nombre: 'Oscilador Colpitts',
        descripcion: 'Utiliza divisor capacitivo con inductor',
        formula: 'f = \\frac{1}{2\\pi\\sqrt{LC_{eq}}}',
        componentes: 'L + 2 Capacitores',
        rango: 'RF (MHz - GHz)',
        estabilidad: 'Alta',
        aplicacion: 'Transmisores RF'
      },
      crystal: {
        nombre: 'Oscilador de Cristal',
        descripcion: 'Utiliza resonancia mecánica de cuarzo',
        formula: 'f = \\frac{n}{2t}\\sqrt{\\frac{E}{\\rho}}',
        componentes: 'Cristal de cuarzo',
        rango: 'kHz - MHz',
        estabilidad: 'Extremadamente Alta (±10 ppm)',
        aplicacion: 'Relojes, microcontroladores'
      }
    };
    return oscillators[this.oscillatorType()];
  }
}
