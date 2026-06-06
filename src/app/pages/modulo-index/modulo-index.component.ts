import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';

@Component({
  selector: 'app-modulo-index',
  standalone: true,
  imports: [CommonModule, RouterLink, PageBackBarComponent],
  template: `
    <div class="page-shell">
      <app-page-back-bar
        [backLink]="'/'"
        [backLabel]="'Inicio'"
        [breadcrumb]="breadcrumb()"
      />

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando módulo...</p>
        </div>
      } @else if (error()) {
        <div class="content-panel">
          <p class="text-error">{{ error() }}</p>
        </div>
      } @else if (modulo()) {
        <header class="page-hero text-center">
          <span class="badge badge--primary badge--lg mb-3">Módulo {{ modulo()!.numero }}</span>
          <h1 class="page-hero__title">{{ modulo()!.titulo }}</h1>
          <p class="page-hero__lead mx-auto">{{ modulo()!.periodo }}</p>
          
          @if (modulo()!.fecha_evaluacion) {
            <div class="flex justify-center gap-4 mt-4 flex-wrap">
              <span class="badge badge--info">
                📅 Evaluación: {{ formatDate(modulo()!.fecha_evaluacion) }}
              </span>
              @if (modulo()!.fecha_extraordinario) {
                <span class="badge badge--warning">
                  📝 Extraordinario: {{ formatDate(modulo()!.fecha_extraordinario) }}
                </span>
              }
            </div>
          }
        </header>

        <section class="section">
          <h2 class="section__title">Unidades del Módulo</h2>
          <div class="content-grid">
            @for (unidad of modulo()!.unidades; track unidad.numero) {
              <article class="card card--bordered card--hover" [routerLink]="['/modulo', modulo()!.numero, 'unidad', unidad.numero]">
                <div class="card__header flex justify-between items-center">
                  <span class="badge badge--primary">Unidad {{ unidad.numero }}</span>
                  <span class="text-xs text-secondary">Semanas {{ unidad.semanas }}</span>
                </div>
                
                <div class="card__body">
                  <h3 class="text-xl font-bold mb-3">{{ unidad.titulo }}</h3>
                  
                  @if (unidad.temas && unidad.temas.length > 0) {
                    <ul class="flex flex-col gap-1 mb-4">
                      @for (tema of unidad.temas.slice(0, 3); track tema) {
                        <li class="text-sm text-secondary flex items-start gap-2">
                          <span class="text-primary-light">•</span>
                          {{ tema }}
                        </li>
                      }
                      @if (unidad.temas.length > 3) {
                        <li class="text-xs text-tertiary italic mt-1">+{{ unidad.temas.length - 3 }} más...</li>
                      }
                    </ul>
                  }

                  @if (unidad.ejercicios && unidad.ejercicios.length > 0) {
                    <span class="badge badge--neutral badge--sm">
                      📚 {{ unidad.ejercicios.length }} ejercicios
                    </span>
                  }
                </div>

                <div class="card__footer">
                  <span class="btn btn--primary btn--sm btn--full">Ver Unidad →</span>
                </div>
              </article>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: []
})
export class ModuloIndexComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  modulo = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  breadcrumb = signal<{ label: string; link?: string }[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const moduloNum = params.get('modulo');
      if (!moduloNum) {
        this.error.set('Número de módulo no especificado');
        this.loading.set(false);
        return;
      }

      this.http.get<any>('/assets/data/planDeEstudio.json').subscribe({
        next: (data) => {
          const modulo = data.plan_de_estudio?.modulos?.find(
            (m: any) => m.numero === parseInt(moduloNum)
          );

          if (modulo) {
            this.modulo.set(modulo);
            this.breadcrumb.set([
              { label: 'Inicio', link: '/' },
              { label: `Módulo ${modulo.numero}` }
            ]);
          } else {
            this.error.set(`Módulo ${moduloNum} no encontrado`);
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar el plan de estudios');
          this.loading.set(false);
        }
      });
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
