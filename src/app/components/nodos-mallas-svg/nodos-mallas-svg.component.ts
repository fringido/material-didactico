import { Component, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KatexDirective } from '../../directives/katex.directive';

export type DiagramMode = 'nodos' | 'mallas';

@Component({
  selector: 'app-nodos-mallas-svg',
  standalone: true,
  imports: [CommonModule, FormsModule, KatexDirective],
  templateUrl: './nodos-mallas-svg.component.html',
  styleUrls: ['./nodos-mallas-svg.component.scss']
})
export class NodosMallasSvgComponent implements OnInit, OnDestroy {
  mode = signal<DiagramMode>('nodos');
  animFrame = 0;
  tick = signal(0);
  isAnimating = signal(true);

  // ─── Parámetros editables ──────────────────────────────────────────────────
  // Nodos: R1, R2, R3, Vs
  R1 = signal(2);
  R2 = signal(4);
  R3 = signal(6);
  Vs = signal(12);

  // Mallas: Ra, Rb, Rc, V1, V2
  Ra = signal(2);
  Rb = signal(3);
  Rc = signal(4);
  V1 = signal(10);
  V2 = signal(6);

  // ─── Análisis de Nodos (2 nodos independientes: V1, V2 respecto a GND) ────
  // Circuito: Vs → R1 → nodo A → R2 → nodo B → R3 → GND
  //                          ↓___________________________↑ (nodo A y B conectados en medio)
  // Simplificamos: divisor con 3 resistencias en serie
  nodoVA = computed(() => {
    const { R1, R2, R3, Vs } = this.params();
    const Req = R1 + R2 + R3;
    return Vs * (R2 + R3) / Req;
  });

  nodoVB = computed(() => {
    const { R1, R2, R3, Vs } = this.params();
    const Req = R1 + R2 + R3;
    return Vs * R3 / Req;
  });

  corrienteNodos = computed(() => {
    const { R1, R2, R3, Vs } = this.params();
    return Vs / (R1 + R2 + R3);
  });

  params = computed(() => ({
    R1: this.R1(), R2: this.R2(), R3: this.R3(), Vs: this.Vs(),
    Ra: this.Ra(), Rb: this.Rb(), Rc: this.Rc(), V1: this.V1(), V2: this.V2()
  }));

  // ─── Análisis de Mallas (2 mallas) ─────────────────────────────────────────
  // Malla 1: V1 - Ra·I1 - Rb·(I1 - I2) = 0
  // Malla 2: -V2 - Rb·(I2 - I1) - Rc·I2 = 0
  malla1 = computed(() => {
    const { Ra, Rb, Rc, V1, V2 } = this.params();
    const det = (Ra + Rb) * (Rb + Rc) - Rb * Rb;
    return ((V1 * (Rb + Rc) - V2 * Rb) / det);
  });

  malla2 = computed(() => {
    const { Ra, Rb, Rc, V1, V2 } = this.params();
    const det = (Ra + Rb) * (Rb + Rc) - Rb * Rb;
    return ((V1 * Rb - V2 * (Ra + Rb)) / det);
  });

  voltajeMallaRb = computed(() => {
    return Math.abs(this.Rb() * (this.malla1() - this.malla2()));
  });

  // ─── Animación ─────────────────────────────────────────────────────────────
  ngOnInit() {
    this.animate();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrame);
  }

  private animate() {
    const loop = () => {
      if (this.isAnimating()) {
        this.tick.update(t => (t + 1) % 360);
      }
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  toggleAnimation() {
    this.isAnimating.update(v => !v);
  }

  setMode(m: DiagramMode) {
    this.mode.set(m);
  }

  // ─── Helpers para animación de corriente ────────────────────────────────────
  // Retorna el dash-offset animado según la velocidad (proporcional a corriente)
  currentDashOffset(corriente: number): number {
    const speed = Math.min(Math.abs(corriente) * 15, 8);
    return -(this.tick() * speed / 10);
  }

  // Opacidad para partículas de corriente
  particleOpacity(index: number): number {
    const phase = (this.tick() + index * 30) % 120;
    return phase < 60 ? phase / 60 : (120 - phase) / 60;
  }

  // Posición de partícula sobre un path lineal
  particleX(x1: number, x2: number, index: number): number {
    const t = ((this.tick() + index * 40) % 120) / 120;
    return x1 + (x2 - x1) * t;
  }
  particleY(y1: number, y2: number, index: number): number {
    const t = ((this.tick() + index * 40) % 120) / 120;
    return y1 + (y2 - y1) * t;
  }

  // Color de corriente basado en dirección
  currentColor(val: number): string {
    return val >= 0 ? '#34D399' : '#F87171';
  }

  formatVal(n: number): string {
    return n.toFixed(2);
  }
}
