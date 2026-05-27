import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';
import { EquationChartComponent } from '../../components/equation-chart/equation-chart.component';

@Component({
  selector: 'app-unidad',
  standalone: true,
  imports: [CommonModule, RouterLink, KatexDirective, PageBackBarComponent, EquationChartComponent],
  templateUrl: './unidad.component.html',
  styleUrls: ['./unidad.component.scss']
})
export class UnidadComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  unidadData = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const modulo = params.get('modulo');
      const unidad = params.get('unidad');
      
      if (modulo && unidad) {
        const path = `/assets/data/modulo-${modulo}/unidad-${unidad}.json`;
        
        this.http.get<any>(path).subscribe({
          next: (data) => {
            this.unidadData.set(data);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(`No se pudo cargar la unidad ${unidad} del módulo ${modulo}`);
            this.loading.set(false);
            console.error(err);
          }
        });
      }
    });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
