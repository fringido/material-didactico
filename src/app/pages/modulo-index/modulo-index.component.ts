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
    <app-page-back-bar
      [backLink]="'/'"
      [backLabel]="'Inicio'"
      [breadcrumb]="breadcrumb()"
    />

    <div class="container">
      @if (loading()) {
        <div class="loading-state">Cargando módulo...</div>
      } @else if (error()) {
        <div class="error-state">{{ error() }}</div>
      } @else if (modulo()) {
        <header class="module-header">
          <div class="module-badge">Módulo {{ modulo()!.numero }}</div>
          <h1 class="module-title">{{ modulo()!.titulo }}</h1>
          <p class="module-period">{{ modulo()!.periodo }}</p>
          @if (modulo()!.fecha_evaluacion) {
            <div class="module-dates">
              <span class="date-item">
                📅 Evaluación: {{ formatDate(modulo()!.fecha_evaluacion) }}
              </span>
              @if (modulo()!.fecha_extraordinario) {
                <span class="date-item">
                  📝 Extraordinario: {{ formatDate(modulo()!.fecha_extraordinario) }}
                </span>
              }
            </div>
          }
        </header>

        <section class="units-section">
          <h2 class="section-title">Unidades del Módulo</h2>
          <div class="units-grid">
            @for (unidad of modulo()!.unidades; track unidad.numero) {
              <article class="unit-card">
                <div class="unit-header">
                  <span class="unit-badge">Unidad {{ unidad.numero }}</span>
                  <span class="unit-weeks">Semanas {{ unidad.semanas }}</span>
                </div>
                <h3 class="unit-title">{{ unidad.titulo }}</h3>
                
                @if (unidad.temas && unidad.temas.length > 0) {
                  <ul class="topic-list">
                    @for (tema of unidad.temas.slice(0, 3); track tema) {
                      <li class="topic-item">{{ tema }}</li>
                    }
                    @if (unidad.temas.length > 3) {
                      <li class="topic-more">+{{ unidad.temas.length - 3 }} más...</li>
                    }
                  </ul>
                }

                @if (unidad.ejercicios && unidad.ejercicios.length > 0) {
                  <div class="unit-exercises">
                    <span class="exercises-badge">
                      📚 {{ unidad.ejercicios.length }} ejercicios
                    </span>
                  </div>
                }

                <a
                  [routerLink]="['/modulo', modulo()!.numero, 'unidad', unidad.numero]"
                  class="unit-link"
                >
                  Ver Unidad →
                </a>
              </article>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .module-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .module-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .module-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0.5rem 0;
    }

    .module-period {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0.5rem 0;
    }

    .module-dates {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .date-item {
      font-size: 0.875rem;
      opacity: 0.95;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1a202c;
    }

    .units-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .unit-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .unit-card:hover {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
      border-color: #667eea;
    }

    .unit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .unit-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #edf2f7;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #4a5568;
    }

    .unit-weeks {
      font-size: 0.75rem;
      color: #718096;
      font-weight: 500;
    }

    .unit-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      color: #2d3748;
      line-height: 1.4;
    }

    .topic-list {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem 0;
    }

    .topic-item {
      font-size: 0.875rem;
      color: #4a5568;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f7fafc;
      line-height: 1.5;
    }

    .topic-item:last-child {
      border-bottom: none;
    }

    .topic-more {
      font-size: 0.875rem;
      color: #718096;
      font-style: italic;
      padding: 0.5rem 0;
    }

    .unit-exercises {
      margin: 1rem 0;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .exercises-badge {
      font-size: 0.875rem;
      color: #4a5568;
      font-weight: 500;
    }

    .unit-link {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .unit-link:hover {
      background: #5568d3;
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: 3rem;
      font-size: 1.125rem;
      color: #718096;
    }

    .error-state {
      color: #e53e3e;
    }
  `]
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
