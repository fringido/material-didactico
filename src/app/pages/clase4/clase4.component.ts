import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';
import { DynamicCircuitSimulatorComponent } from '../../components/dynamic-circuit-simulator/dynamic-circuit-simulator.component';
import { EquationChartComponent } from '../../components/equation-chart/equation-chart.component';
import { FormulaTooltipDirective } from '../../directives/formula-tooltip.directive';
import { NodosMallasSvgComponent } from '../../components/nodos-mallas-svg/nodos-mallas-svg.component';
import { TheveninCalculatorComponent } from '../../components/thevenin-calculator/thevenin-calculator.component';
import { NortonTransformerComponent } from '../../components/norton-transformer/norton-transformer.component';
import { BlackBoxSimulatorComponent } from '../../components/black-box-simulator/black-box-simulator.component';
import { CircuitAnalyzerComponent } from '../../components/circuit-analyzer/circuit-analyzer.component';
import { MethodComparatorComponent } from '../../components/method-comparator/method-comparator.component';

@Component({
  selector: 'app-clase4',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    PageBackBarComponent,
    DynamicCircuitSimulatorComponent,
    EquationChartComponent,
    FormulaTooltipDirective,
    NodosMallasSvgComponent,
    TheveninCalculatorComponent,
    NortonTransformerComponent,
    BlackBoxSimulatorComponent,
    CircuitAnalyzerComponent,
    MethodComparatorComponent,
  ],
  templateUrl: './clase4.component.html',
  styleUrls: ['./clase4.component.scss']
})
export class Clase4Component implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  data = signal<any>(null);
  temaDetallado = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Exercise timer state
  activeExercise = signal<string | null>(null);
  timerRemaining = signal<number>(0);
  timerInterval: any = null;
  showSolution = signal<Record<string, boolean>>({});

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const temaId = params.get('id');
      console.log('Clase4Component: Route parameter id =', temaId);

      if (temaId) {
        // Load specific topic directly
        console.log('Clase4Component: Loading topic from', `/assets/data/clase-4/${temaId}.json`);
        this.http.get<any>(`/assets/data/clase-4/${temaId}.json`).subscribe({
          next: (detalle) => {
            console.log('Clase4Component: Loaded detalle =', detalle);
            this.temaDetallado.set({ id: temaId, nombre: detalle.nombre, descripcion: detalle.descripcion, detalle });
            this.loading.set(false);
            console.log('Clase4Component: temaDetallado set to', this.temaDetallado());
          },
          error: (err) => {
            console.error('Clase4Component: Error loading topic', err);
            this.error.set(`No se pudo cargar el tema "${temaId}".`);
            this.loading.set(false);
          }
        });
      } else {
        // Load index and first topic
        console.log('Clase4Component: No temaId, loading index');
        this.http.get<any>('/assets/data/clase-4/index.json').subscribe({
          next: (d) => {
            console.log('Clase4Component: Loaded index =', d);
            this.data.set(d);
            this.cargarTemaDetallado(d.temas[0]);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudo cargar el índice de la Clase 4.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private cargarTemaDetallado(tema: any) {
    this.http.get<any>(`/assets/data/clase-4/${tema.archivo}`).subscribe({
      next: (detalle) => {
        this.temaDetallado.set({ ...tema, detalle });
      },
      error: () => {
        this.temaDetallado.set({ ...tema, detalle: null });
      }
    });
  }

  getTooltipVariables(tooltipId: string): any[] {
    const tema = this.temaDetallado();
    if (!tema?.detalle?.variables_tooltips) return [];
    return tema.detalle.variables_tooltips[tooltipId] || [];
  }

  getVariablesForFormula(formula: any): any[] {
    const tooltipId = formula.variables_tooltip;
    return this.getTooltipVariables(tooltipId);
  }

  formatSubscripts(text: string | null | undefined): string {
    if (!text) return '';
    return text.replace(/([A-Za-z])_([A-Za-z0-9]+)/g, '$1<sub>$2</sub>');
  }

  startExerciseTimer(exerciseId: string, minutes: number) {
    // Clear any existing timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.activeExercise.set(exerciseId);
    this.timerRemaining.set(minutes * 60); // Convert to seconds
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
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.showSolution.update(s => ({ ...s, [exerciseId]: true }));
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getNodosExercises() {
    const tema = this.temaDetallado();
    if (!tema?.detalle?.ejercicios) return [];
    return tema.detalle.ejercicios.filter((e: any) => e.categoria === 'nodos');
  }

  getMallasExercises() {
    const tema = this.temaDetallado();
    if (!tema?.detalle?.ejercicios) return [];
    return tema.detalle.ejercicios.filter((e: any) => e.categoria === 'mallas');
  }
}
