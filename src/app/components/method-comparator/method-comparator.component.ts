import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

const PRESET_CIRCUITS = [
  { label: 'Divisor 2R', nodes: 2, meshes: 1 },
  { label: 'Puente 4R', nodes: 3, meshes: 2 },
  { label: 'Escalera 3 nodos', nodes: 3, meshes: 3 },
  { label: 'Circuito ventana', nodes: 4, meshes: 3 },
  { label: 'Red compleja', nodes: 6, meshes: 5 },
];

@Component({
  selector: 'app-method-comparator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './method-comparator.component.html',
  styleUrls: ['./method-comparator.component.scss'],
})
export class MethodComparatorComponent {
  private readonly fb = new FormBuilder();
  presets = PRESET_CIRCUITS;

  form = this.fb.group({
    nodes:  [4, [Validators.required, Validators.min(2), Validators.max(20)]],
    meshes: [3, [Validators.required, Validators.min(1), Validators.max(20)]],
  });

  nodes  = signal(4);
  meshes = signal(3);

  nodeEqs  = computed(() => this.nodes() - 1);
  meshEqs  = computed(() => this.meshes());
  winner   = computed(() => this.nodeEqs() <= this.meshEqs() ? 'nodos' : 'mallas');
  diff     = computed(() => Math.abs(this.nodeEqs() - this.meshEqs()));
  maxEqs   = computed(() => Math.max(this.nodeEqs(), this.meshEqs(), 1));

  // History of comparisons
  history = signal<{nodes: number; meshes: number; winner: string}[]>([]);

  apply() {
    if (this.form.valid) {
      const v = this.form.value;
      this.nodes.set(v.nodes!);
      this.meshes.set(v.meshes!);
      this.history.update(h => [
        { nodes: v.nodes!, meshes: v.meshes!, winner: this.winner() },
        ...h,
      ].slice(0, 6));
    }
  }

  applyPreset(p: typeof PRESET_CIRCUITS[0]) {
    this.form.setValue({ nodes: p.nodes, meshes: p.meshes });
    this.nodes.set(p.nodes);
    this.meshes.set(p.meshes);
    this.history.update(h => [
      { nodes: p.nodes, meshes: p.meshes, winner: this.winner() },
      ...h,
    ].slice(0, 6));
  }

  fmt(n: number): string { return String(n); }
}
