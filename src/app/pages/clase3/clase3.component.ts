import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';
import { OhmLawLabComponent } from '../../components/clase3-labs/ohm-law-lab.component';
import { TopologyLabComponent } from '../../components/clase3-labs/topology-lab.component';
import { KirchhoffLabComponent } from '../../components/clase3-labs/kirchhoff-lab.component';

@Component({
  selector: 'app-clase3',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    PageBackBarComponent,
    OhmLawLabComponent,
    TopologyLabComponent,
    KirchhoffLabComponent
  ],
  templateUrl: './clase3.component.html',
  styleUrls: ['./clase3.component.scss']
})
export class Clase3Component implements OnInit {
  private readonly http = inject(HttpClient);
  data = signal<any>(null);
  temasDetallados = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.http.get<any>('/assets/data/clase-3/index.json').subscribe({
      next: (d) => {
        this.data.set(d);
        this.cargarTemasDetallados(d.temas);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el índice de la Clase 3.');
        this.loading.set(false);
      }
    });
  }

  private cargarTemasDetallados(temas: any[]) {
    const temasDetallados: any[] = [];
    let cargados = 0;

    temas.forEach((tema) => {
      this.http.get<any>(`/assets/data/clase-3/${tema.archivo}`).subscribe({
        next: (detalle) => {
          temasDetallados.push({ ...tema, detalle });
          cargados++;
          if (cargados === temas.length) {
            const sorted = [...temasDetallados].sort((a, b) => a.detalle.metadata.orden - b.detalle.metadata.orden);
            this.temasDetallados.set(sorted);
          }
        },
        error: () => {
          cargados++;
          if (cargados === temas.length) {
            this.temasDetallados.set(temasDetallados);
          }
        }
      });
    });
  }
}
