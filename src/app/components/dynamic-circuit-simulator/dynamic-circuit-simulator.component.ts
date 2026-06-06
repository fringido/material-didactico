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

  // Returns current value for a diagram element ID
  getLiveValue(el: any): string {
    const vals = this.controlValues();
    
    // Check for exact ID match
    if (el.id && vals[el.id] !== undefined) {
      return `${vals[el.id]}${this.getUnidad(el.id)}`;
    }
    
    // Check for val_ prefix match (common convention in our JSONs)
    const valId = `val_${el.id}`;
    if (el.id && vals[valId] !== undefined) {
      return `${vals[valId]}${this.getUnidad(valId)}`;
    }

    return el.valor || '';
  }

  private getUnidad(id: string): string {
    const ctrl = this.simulacion.controles.find(c => c.id === id);
    return ctrl?.unidad || '';
  }

  // Returns the X position for the current value indicator on a graph
  getCurrentPointX(grafica: any): number {
    if (!/\bx\b/.test(grafica.calculo_y)) return -1;
    
    const firstCtrl = this.simulacion?.controles?.length ? this.simulacion.controles[0] : null;
    if (!firstCtrl) return -1;

    const currentVal = this.controlValues()[firstCtrl.id] || 0;
    const range = firstCtrl.max - firstCtrl.min || 1;
    const normalized = (currentVal - firstCtrl.min) / range;
    
    return normalized * 300; // width of wave-viewer
  }

  private cachedFuncs = new Map<string, Function>();

  private getFormulaFunc(grafica: any, keys: string[]): Function | null {
    const cacheKey = `${grafica.id}-${keys.join(',')}-${grafica.calculo_y}`;
    if (this.cachedFuncs.has(cacheKey)) return this.cachedFuncs.get(cacheKey)!;

    try {
      const func = new Function('x', 't', ...keys, `return ${grafica.calculo_y}`);
      this.cachedFuncs.set(cacheKey, func);
      return func;
    } catch (e) {
      console.error('DynamicSimulator: Error creating function for', grafica.id, e);
      return null;
    }
  }

  generateWavePath(grafica: any): string {
    const points: string[] = [];
    const samples = 100;
    const width = 300;
    const height = 100;
    const t = this.animationTime();
    const vals = this.controlValues();
    
    const keys = Object.keys(vals);
    if (keys.length === 0) return '';
    const values = keys.map(k => vals[k]);

    const func = this.getFormulaFunc(grafica, keys);
    if (!func) return '';

    try {
      const firstCtrl = this.simulacion?.controles?.length ? this.simulacion.controles[0] : null;
      const xIsControlRange = typeof grafica.calculo_y === 'string' && /\bx\b/.test(grafica.calculo_y) && !!firstCtrl;

      // First pass: collect all y values to compute range for auto-scaling
      const rawValues: number[] = [];
      for (let i = 0; i <= samples; i++) {
        const normalized = i / samples;
        let xArg: number;
        if (xIsControlRange && firstCtrl) {
          xArg = firstCtrl.min + normalized * (firstCtrl.max - firstCtrl.min);
        } else {
          xArg = (normalized * 4 * Math.PI) - t;
        }
        
        try {
          const yVal = func(xArg, t, ...values);
          if (typeof yVal === 'number' && Number.isFinite(yVal)) {
            rawValues.push(yVal);
          }
        } catch (_) {}
      }

      if (rawValues.length === 0) return '';

      const minVal = Math.min(...rawValues);
      const maxVal = Math.max(...rawValues);
      const rangeY = maxVal - minVal || 1;

      for (let i = 0; i <= samples; i++) {
        const x_screen = (i / samples) * width;
        const normalized = i / samples;
        let xArg: number;
        if (xIsControlRange && firstCtrl) {
          xArg = firstCtrl.min + normalized * (firstCtrl.max - firstCtrl.min);
        } else {
          xArg = (normalized * 4 * Math.PI) - t;
        }

        try {
          const yVal = func(xArg, t, ...values);
          if (!Number.isFinite(yVal)) continue;

          const normalized_y = (yVal - minVal) / rangeY;
          const scaledY = (height - 10) - normalized_y * (height - 20) + 5;

          if (points.length === 0) {
            points.push(`M ${x_screen} ${scaledY}`);
          } else {
            points.push(`L ${x_screen} ${scaledY}`);
          }
        } catch (_) {}
      }
    } catch(e) {
      console.error('DynamicSimulator: Critical error in path generation', e);
      return '';
    }

    return points.join(' ');
  }
}
