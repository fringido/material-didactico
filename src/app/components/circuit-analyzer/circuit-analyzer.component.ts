import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface CircuitTopology {
  nodes: number;
  meshes: number;
  hasSupernode: boolean;
  hasSupermesh: boolean;
  isPlanar: boolean;
}

@Component({
  selector: 'app-circuit-analyzer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './circuit-analyzer.component.html',
  styleUrls: ['./circuit-analyzer.component.scss'],
})
export class CircuitAnalyzerComponent {
  private readonly fb = new FormBuilder();

  form = this.fb.group({
    nodes:         [4, [Validators.required, Validators.min(2), Validators.max(20)]],
    meshes:        [3, [Validators.required, Validators.min(1), Validators.max(20)]],
    hasSupernode:  [false],
    hasSupermesh:  [false],
    isPlanar:      [true],
  });

  topology = signal<CircuitTopology>({
    nodes: 4, meshes: 3, hasSupernode: false, hasSupermesh: false, isPlanar: true,
  });

  recommendation = computed(() => {
    const t = this.topology();
    const nodeEqs = t.nodes - 1;
    const meshEqs = t.meshes;

    if (!t.isPlanar) {
      return {
        method: 'Nodos',
        reason: 'Circuito no-plano: el análisis de mallas requiere circuito plano.',
        eqs: nodeEqs,
        color: '#38bdf8',
      };
    }
    if (t.hasSupernode && !t.hasSupermesh) {
      return {
        method: 'Nodos',
        reason: 'Hay un supernodo (fuente de voltaje entre 2 nodos) — Nodos lo maneja naturalmente.',
        eqs: nodeEqs,
        color: '#38bdf8',
      };
    }
    if (t.hasSupermesh && !t.hasSupernode) {
      return {
        method: 'Mallas',
        reason: 'Hay una supermalla (fuente de corriente compartida) — Mallas lo maneja naturalmente.',
        eqs: meshEqs,
        color: '#a78bfa',
      };
    }
    if (nodeEqs <= meshEqs) {
      return {
        method: 'Nodos',
        reason: `${nodeEqs} ecuaciones vs ${meshEqs} de mallas. Nodos requiere menos trabajo.`,
        eqs: nodeEqs,
        color: '#38bdf8',
      };
    }
    return {
      method: 'Mallas',
      reason: `${meshEqs} ecuaciones vs ${nodeEqs} de nodos. Mallas requiere menos trabajo.`,
      eqs: meshEqs,
      color: '#a78bfa',
    };
  });

  nodeEquations = computed(() => this.topology().nodes - 1);
  meshEquations = computed(() => this.topology().meshes);
  savings = computed(() =>
    Math.abs(this.nodeEquations() - this.meshEquations())
  );

  analyze() {
    if (this.form.valid) {
      const v = this.form.value;
      this.topology.set({
        nodes:        v.nodes!,
        meshes:       v.meshes!,
        hasSupernode: v.hasSupernode!,
        hasSupermesh: v.hasSupermesh!,
        isPlanar:     v.isPlanar!,
      });
    }
  }
}
