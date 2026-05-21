import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { EquationChartComponent, ChartType } from '../../components/equation-chart/equation-chart.component';
import { OhmLawLabComponent } from '../../components/clase3-labs/ohm-law-lab.component';
import { PipeAnalogyComponent } from '../../components/clase3-labs/pipe-analogy.component';
import { TopologyLabComponent } from '../../components/clase3-labs/topology-lab.component';
import { KirchhoffLabComponent } from '../../components/clase3-labs/kirchhoff-lab.component';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';

const TEMA_IDS = ['ley-de-ohm', 'tipos-circuitos', 'leyes-kirchhoff'] as const;

@Component({
  selector: 'app-tema-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    EquationChartComponent,
    OhmLawLabComponent,
    PipeAnalogyComponent,
    TopologyLabComponent,
    KirchhoffLabComponent,
    PageBackBarComponent
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

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id || !TEMA_IDS.includes(id as typeof TEMA_IDS[number])) {
        this.error.set('Tema no encontrado.');
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.http.get<any>(`/assets/data/clase-3/${id}.json`).subscribe({
        next: (data) => {
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
}
