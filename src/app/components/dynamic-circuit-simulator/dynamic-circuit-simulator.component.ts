import { Component, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';
import { SimulacionDinamica } from '../../models/componentes.model';
import { MatrixVisualizerComponent } from '../matrix-visualizer/matrix-visualizer.component';
import { KirchhoffLabComponent } from '../clase3-labs/kirchhoff-lab.component';
import { OhmLawLabComponent } from '../clase3-labs/ohm-law-lab.component';
import { TopologyLabComponent } from '../clase3-labs/topology-lab.component';

@Component({
  selector: 'app-dynamic-circuit-simulator',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    KatexDirective, 
    MatrixVisualizerComponent,
    KirchhoffLabComponent,
    OhmLawLabComponent,
    TopologyLabComponent
  ],
  templateUrl: './dynamic-circuit-simulator.component.html',
  styleUrls: ['./dynamic-circuit-simulator.component.scss']
})
export class DynamicCircuitSimulatorComponent implements OnInit, OnDestroy {
  @Input({ required: true }) simulacion!: SimulacionDinamica;

  // Animation state
  animationTime = signal(0);
  isPlaying = signal(true);
  private animationFrame?: number;

  // Reactive state for controls.
  // Stored as a Map or Record of control ID -> value
  controlValues = signal<Record<string, number>>({});

  // Computed metrics based on formulas in JSON
  metricasEvaluadas = computed(() => {
    const vals = this.controlValues();
    return this.simulacion.metricas.map(m => {
      try {
        // Very simple expression evaluator for trusted local JSON strings
        const func = new Function(...Object.keys(vals), `return ${m.calculo}`);
        const val = func(...Object.values(vals));
        return { ...m, valorCalculado: val };
      } catch (e) {
        console.error('Error evaluating metric', m.label, e);
        return { ...m, valorCalculado: 0 };
      }
    });
  });

  ngOnInit() {
    // Initialize control values
    const initialVals: Record<string, number> = {};
    for (const ctrl of this.simulacion.controles) {
      initialVals[ctrl.id] = ctrl.default;
    }
    this.controlValues.set(initialVals);

    this.startAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  updateControl(id: string, value: any) {
    const num = Number.parseFloat(value);
    if (!Number.isNaN(num)) {
      this.controlValues.update(vals => ({ ...vals, [id]: num }));
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

  generateWavePath(grafica: any): string {
    const points: string[] = [];
    const samples = 100;
    const width = 300;
    const height = 100;
    const centerY = height / 2;
    const t = this.animationTime();
    const vals = this.controlValues();
    const keys = Object.keys(vals);
    const values = Object.values(vals);

    try {
      // Build a function where 'x' is the first arg, then time 't', then control keys
      const func = new Function('x', 't', ...keys, `return ${grafica.calculo_y}`);

      // Determine if the formula uses a control-like "x" axis.
      // If so, map screen x to the range of the first control (commonly R2 in our JSON).
      const firstCtrl = this.simulacion?.controles?.length ? this.simulacion.controles[0] : null;
      const xIsControlRange = typeof grafica.calculo_y === 'string' && grafica.calculo_y.includes('x') && !!firstCtrl;

      for (let i = 0; i <= samples; i++) {
        const x_screen = (i / samples) * width;
        const normalized = i / samples;

        // If formula expects 'x' to be a control (e.g., R2), map normalized into [min,max]
        let xArg: number;
        if (xIsControlRange && firstCtrl) {
          const min = Number(firstCtrl.min) || 0;
          const max = Number(firstCtrl.max) || 1;
          // Map normalized [0,1] to [min,max]
          xArg = min + normalized * (max - min);
        } else {
          // Use a time-like x so waves look animated
          xArg = (normalized * 4 * Math.PI) - t;
        }

        const yVal = func(xArg, t, ...values);

        // Scale for rendering (hardcoded scaling for now, could be dynamic)
        const scaledY = centerY - (yVal * 5);

        if (i === 0) {
          points.push(`M ${x_screen} ${scaledY}`);
        } else {
          points.push(`L ${x_screen} ${scaledY}`);
        }
      }
    } catch(e) {
      console.error('Error in wave calculation', e);
      return '';
    }

    return points.join(' ');
  }
}
