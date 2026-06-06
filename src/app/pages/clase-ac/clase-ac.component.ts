import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { FormulaTooltipDirective } from '../../directives/formula-tooltip.directive';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';
import { BodeChartComponent } from '../../components/bode-chart/bode-chart.component';
import { DynamicCircuitSimulatorComponent } from '../../components/dynamic-circuit-simulator/dynamic-circuit-simulator.component';

@Component({
  selector: 'app-clase-ac',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    FormulaTooltipDirective,
    PageBackBarComponent,
    BodeChartComponent,
    DynamicCircuitSimulatorComponent
  ],
  templateUrl: './clase-ac.component.html',
  styleUrls: ['./clase-ac.component.scss']
})
export class ClaseAcComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  data = signal<any>(null);
  temaDetallado = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Exercise state
  activeExercise = signal<string | null>(null);
  timerRemaining = signal<number>(0);
  timerInterval: any = null;
  showSolution = signal<Record<string, boolean>>({});

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const temaId = params.get('id');
      this.loading.set(true);

      if (temaId) {
        this.http.get<any>(`/assets/data/clase-ac/${temaId}.json`).subscribe({
          next: (detalle) => {
            this.temaDetallado.set({ id: temaId, nombre: detalle.nombre || detalle.titulo, descripcion: detalle.descripcion, detalle });
            this.data.set(null);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error loading AC topic', err);
            this.error.set(`No se pudo cargar el tema "${temaId}".`);
            this.loading.set(false);
          }
        });
      } else {
        this.http.get<any>('/assets/data/clase-ac/index.json').subscribe({
          next: (d) => {
            this.data.set(d);
            this.temaDetallado.set(null);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudo cargar el índice de la Clase AC.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startExerciseTimer(exerciseId: string, minutes: number) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.activeExercise.set(exerciseId);
    this.timerRemaining.set(minutes * 60);
    this.showSolution.update(s => ({ ...s, [exerciseId]: false }));
    this.timerInterval = setInterval(() => {
      this.timerRemaining.update(time => {
        if (time <= 1) {
          this.timerComplete(exerciseId);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }

  private timerComplete(exerciseId: string) {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.showSolution.update(s => ({ ...s, [exerciseId]: true }));
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
