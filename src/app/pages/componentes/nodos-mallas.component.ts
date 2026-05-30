import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { FormulaTooltipDirective } from '../../directives/formula-tooltip.directive';
import { EquationChartComponent } from '../../components/equation-chart/equation-chart.component';
import { DynamicCircuitSimulatorComponent } from '../../components/dynamic-circuit-simulator/dynamic-circuit-simulator.component';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';

@Component({
  selector: 'app-nodos-mallas',
  standalone: true,
  imports: [
    CommonModule,
    KatexDirective,
    FormulaTooltipDirective,
    EquationChartComponent,
    DynamicCircuitSimulatorComponent,
    PageBackBarComponent
  ],
  templateUrl: './nodos-mallas.component.html',
  styleUrls: ['./nodos-mallas.component.scss']
})
export class NodosMallasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  data = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.http.get<any>('/assets/data/clase-4/NodosYMallas.json').subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el contenido de Nodos y Mallas.');
        this.loading.set(false);
      }
    });
  }

  getVariablesForFormula(formula: any) {
    return this.data()?.variables_tooltips?.[formula.variables_tooltip] || [];
  }
}
