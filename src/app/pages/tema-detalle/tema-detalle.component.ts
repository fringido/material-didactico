import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { FormulaTooltipDirective } from '../../directives/formula-tooltip.directive';
import { EquationChartComponent, ChartType } from '../../components/equation-chart/equation-chart.component';
import { OhmLawLabComponent } from '../../components/clase3-labs/ohm-law-lab.component';
import { PipeAnalogyComponent } from '../../components/clase3-labs/pipe-analogy.component';
import { TopologyLabComponent } from '../../components/clase3-labs/topology-lab.component';
import { KirchhoffLabComponent } from '../../components/clase3-labs/kirchhoff-lab.component';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';
import { DynamicCircuitSimulatorComponent } from '../../components/dynamic-circuit-simulator/dynamic-circuit-simulator.component';

const TEMA_IDS_BY_CLASS: Record<number, string[]> = {
  3: ['ley-de-ohm', 'tipos-circuitos', 'leyes-kirchhoff'],
  4: ['resistencia-equivalente', 'nodos-mallas', 'maximum-power-transfer'],
};

@Component({
  selector: 'app-tema-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    FormulaTooltipDirective,
    EquationChartComponent,
    OhmLawLabComponent,
    PipeAnalogyComponent,
    TopologyLabComponent,
    KirchhoffLabComponent,
    PageBackBarComponent,
    DynamicCircuitSimulatorComponent,
  ],
  templateUrl: './tema-detalle.component.html',
  styleUrls: ['./tema-detalle.component.scss']
})
export class TemaDetalleComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  tema = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  claseNum = signal<number>(3);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      // Derive clase number from the URL (e.g. /clase/4/tema/...)
      const urlSegments = this.route.snapshot.pathFromRoot
        .flatMap(r => r.url)
        .map(u => u.path);
      const claseIdx = urlSegments.indexOf('clase');
      const claseNumber = claseIdx >= 0 ? Number(urlSegments[claseIdx + 1]) : 3;
      const validClase = TEMA_IDS_BY_CLASS[claseNumber] ? claseNumber : 3;
      this.claseNum.set(validClase);

      const validIds = TEMA_IDS_BY_CLASS[validClase];
      if (!id || !validIds.includes(id)) {
        this.error.set('Tema no encontrado.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.http.get<any>(`/assets/data/clase-${validClase}/${id}.json`).subscribe({
        next: (data) => {
          // Normalizar convencion_signos a siempre ser array (Clase 3)
          if (data.leyes) {
            data.leyes = data.leyes.map((ley: any) => {
              if (ley.convencion_signos && typeof ley.convencion_signos === 'string') {
                ley.convencion_signos = [{ caso: 'General', regla: ley.convencion_signos }];
              }
              return ley;
            });
          }
          this.tema.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(`No se pudo cargar el tema "${id}".`);
          this.loading.set(false);
        }
      });
    });
  }

  chartType(inter: { chartType?: string }): ChartType {
    return (inter.chartType as ChartType) || 'ohm';
  }

  onImageError(event: Event, src: string): void {
    console.error('Error loading image:', src, event);
  }

  /** Returns the tooltip variables array for a Clase 4 formula */
  getVariablesForFormula(formula: any): any[] {
    const tooltipId = formula?.variables_tooltip;
    if (!tooltipId || !this.tema()?.variables_tooltips) return [];
    return this.tema().variables_tooltips[tooltipId] || [];
  }

  get backLink(): string {
    return `/clase/${this.claseNum()}`;
  }

  get backLabel(): string {
    return `Volver a Clase ${this.claseNum()}`;
  }
}
