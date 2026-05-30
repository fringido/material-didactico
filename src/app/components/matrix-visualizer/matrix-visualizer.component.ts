import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatricaDinamica } from '../../models/componentes.model';

@Component({
  selector: 'app-matrix-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './matrix-visualizer.component.html',
  styleUrls: ['./matrix-visualizer.component.scss']
})
export class MatrixVisualizerComponent {
  @Input({ required: true }) matriz!: MatricaDinamica;
  @Input({ required: true }) controlValues!: Record<string, number>;

  // Evaluamos dinámicamente las filas usando los valores actuales
  matrizEvaluada = computed(() => {
    const vals = this.controlValues;
    return this.matriz.filas.map(fila => {
      return fila.map(expresion => {
        try {
          const func = new Function(...Object.keys(vals), `return ${expresion}`);
          const res = func(...Object.values(vals));
          return Number.isInteger(res) ? res.toString() : res.toFixed(2);
        } catch (e) {
          // If it fails (maybe it's a constant string that isn't valid JS without quotes), just return it
          return expresion;
        }
      });
    });
  });

  // Split matrix into A (coefficients) and B (constants)
  matrizA = computed(() => {
    return this.matrizEvaluada().map(fila => fila.slice(0, -1));
  });

  vectorB = computed(() => {
    return this.matrizEvaluada().map(fila => fila[fila.length - 1]);
  });
}
