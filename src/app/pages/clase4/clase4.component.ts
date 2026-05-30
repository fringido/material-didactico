import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';
import { DynamicCircuitSimulatorComponent } from '../../components/dynamic-circuit-simulator/dynamic-circuit-simulator.component';
import { EquationChartComponent } from '../../components/equation-chart/equation-chart.component';
import { CurrentFlowAnimatorComponent } from '../../components/current-flow-animator/current-flow-animator.component';
import { FormulaTooltipDirective } from '../../directives/formula-tooltip.directive';
import { NodosMallasSvgComponent } from '../../components/nodos-mallas-svg/nodos-mallas-svg.component';

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
    CurrentFlowAnimatorComponent,
    FormulaTooltipDirective,
    NodosMallasSvgComponent
  ],
  templateUrl: './clase4.component.html',
  styleUrls: ['./clase4.component.scss']
})
export class Clase4Component implements OnInit {
  private readonly http = inject(HttpClient);
  data = signal<any>(null);
  temaDetallado = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.http.get<any>('/assets/data/clase-4/index.json').subscribe({
      next: (d) => {
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
}
