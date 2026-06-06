import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';

interface Clase {
  semana: number;
  tema: string;
  clase: number;
  actividad: string;
  temas?: { id: string; nombre: string; ruta: string; icono?: string }[];
}

@Component({
  selector: 'app-semana-index',
  standalone: true,
  imports: [CommonModule, RouterLink, PageBackBarComponent],
  template: `
    <app-page-back-bar
      [backLink]="backLink()"
      [backLabel]="'Módulo ' + moduloNum()"
      [breadcrumb]="breadcrumb()"
    />

    <div class="container">
      @if (loading()) {
        <div class="loading-state">Cargando unidad...</div>
      } @else if (error()) {
        <div class="error-state">{{ error() }}</div>
      } @else if (unidad()) {
        <header class="unit-header">
          <div class="unit-meta">
            <span class="meta-badge">Módulo {{ moduloNum() }}</span>
            <span class="meta-badge">Unidad {{ unidad()!.numero }}</span>
            <span class="meta-badge">Semanas {{ unidad()!.semanas }}</span>
          </div>
          <h1 class="unit-title">{{ unidad()!.titulo }}</h1>
        </header>

        <section class="weeks-section">
          <h2 class="section-title">Clases por Semana</h2>
          <div class="weeks-grid">
            @for (semana of semanasAgrupadas(); track semana.numero) {
              <article class="week-card">
                <div class="week-header">
                  <h3 class="week-title">Semana {{ semana.numero }}</h3>
                  <span class="week-badge">{{ semana.clases.length }} clase(s)</span>
                </div>

                @for (clase of semana.clases; track clase.semana + '-' + clase.clase) {
                  <div class="clase-item">
                    <h4 class="clase-topic">{{ clase.tema }}</h4>
                    <p class="clase-activity">{{ clase.actividad }}</p>

                    @if (clase.temas && clase.temas.length > 0) {
                      <div class="topics-list">
                        @for (tema of clase.temas; track tema.id) {
                          <a [routerLink]="tema.ruta" class="topic-link">
                            @if (tema.icono) {
                              <span class="topic-icon">{{ tema.icono }}</span>
                            }
                            <span class="topic-name">{{ tema.nombre }}</span>
                            <span class="topic-arrow">→</span>
                          </a>
                        }
                      </div>
                    }
                  </div>
                }
              </article>
            }
          </div>
        </section>

        @if (unidad()!.ejercicios && unidad()!.ejercicios.length > 0) {
          <section class="exercises-section">
            <h2 class="section-title">Ejercicios Propuestos</h2>
            <div class="exercises-list">
              @for (ejercicio of unidad()!.ejercicios; track ejercicio.numero) {
                <div class="exercise-item">
                  <span class="exercise-number">Ejercicio {{ ejercicio.numero }}</span>
                  <p class="exercise-description">{{ ejercicio.descripcion }}</p>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .unit-header {
      margin-bottom: 3rem;
      padding: 2rem;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 12px;
      color: white;
    }

    .unit-meta {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .meta-badge {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .unit-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.3;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1a202c;
    }

    .weeks-grid {
      display: grid;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .week-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .week-card:hover {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }

    .week-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .week-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: #2d3748;
    }

    .week-badge {
      padding: 0.375rem 0.875rem;
      background: #edf2f7;
      border-radius: 16px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #4a5568;
    }

    .clase-item {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .clase-item:last-child {
      margin-bottom: 0;
    }

    .clase-topic {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #2d3748;
    }

    .clase-activity {
      font-size: 0.9375rem;
      color: #4a5568;
      margin: 0 0 1rem 0;
      line-height: 1.6;
    }

    .topics-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .topic-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-decoration: none;
      color: #2d3748;
      transition: all 0.2s ease;
    }

    .topic-link:hover {
      background: #4facfe;
      color: white;
      border-color: #4facfe;
      transform: translateX(4px);
    }

    .topic-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .topic-name {
      flex: 1;
      font-weight: 500;
      font-size: 0.9375rem;
    }

    .topic-arrow {
      font-weight: 600;
      opacity: 0.5;
      transition: opacity 0.2s ease;
    }

    .topic-link:hover .topic-arrow {
      opacity: 1;
    }

    .exercises-section {
      margin-top: 3rem;
      padding: 2rem;
      background: #faf5ff;
      border-radius: 12px;
      border: 1px solid #e9d8fd;
    }

    .exercises-list {
      display: grid;
      gap: 1rem;
    }

    .exercise-item {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border-left: 4px solid #9f7aea;
    }

    .exercise-number {
      display: inline-block;
      font-weight: 700;
      color: #553c9a;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .exercise-description {
      margin: 0;
      color: #4a5568;
      font-size: 0.9375rem;
      line-height: 1.6;
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
export class SemanaIndexComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  unidad = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  moduloNum = signal<string>('');
  unidadNum = signal<string>('');
  backLink = signal<string>('/');
  breadcrumb = signal<{ label: string; link?: string }[]>([]);
  semanasAgrupadas = signal<{ numero: number; clases: Clase[] }[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const moduloNum = params.get('modulo');
      const unidadNum = params.get('unidad');

      if (!moduloNum || !unidadNum) {
        this.error.set('Parámetros de ruta inválidos');
        this.loading.set(false);
        return;
      }

      this.moduloNum.set(moduloNum);
      this.unidadNum.set(unidadNum);
      this.backLink.set(`/modulo/${moduloNum}`);

      this.http.get<any>('/assets/data/planDeEstudio.json').subscribe({
        next: (data) => {
          const modulo = data.plan_de_estudio?.modulos?.find(
            (m: any) => m.numero === parseInt(moduloNum)
          );

          if (modulo) {
            const unidad = modulo.unidades?.find(
              (u: any) => u.numero === parseInt(unidadNum)
            );

            if (unidad) {
              this.loadUnidadData(unidad, modulo);
            } else {
              this.error.set(`Unidad ${unidadNum} no encontrada en Módulo ${moduloNum}`);
              this.loading.set(false);
            }
          } else {
            this.error.set(`Módulo ${moduloNum} no encontrado`);
            this.loading.set(false);
          }
        },
        error: () => {
          this.error.set('Error al cargar el plan de estudios');
          this.loading.set(false);
        }
      });
    });
  }

  private loadUnidadData(unidad: any, modulo: any) {
    // For Unidad 3 (AC Circuits), load topics from clase-ac index
    if (unidad.numero === 3 && modulo.numero === 1) {
      this.http.get<any>('/assets/data/clase-ac/index.json').subscribe({
        next: (acData) => {
          // Enrich semana_detalle with actual topic data
          const enrichedSemanas = (unidad.semana_detalle || []).map((clase: Clase) => ({
            ...clase,
            temas: acData.temas || []
          }));

          this.unidad.set({ ...unidad, semana_detalle: enrichedSemanas });
          this.agruparPorSemana(enrichedSemanas);
          this.setBreadcrumb(modulo, unidad);
          this.loading.set(false);
        },
        error: () => {
          // Fallback if clase-ac index not found
          this.unidad.set(unidad);
          this.agruparPorSemana(unidad.semana_detalle || []);
          this.setBreadcrumb(modulo, unidad);
          this.loading.set(false);
        }
      });
    } else {
      // For other units, use data as-is
      this.unidad.set(unidad);
      this.agruparPorSemana(unidad.semana_detalle || []);
      this.setBreadcrumb(modulo, unidad);
      this.loading.set(false);
    }
  }

  private agruparPorSemana(semanaDetalle: Clase[]) {
    const grouped = new Map<number, Clase[]>();

    semanaDetalle.forEach(clase => {
      if (!grouped.has(clase.semana)) {
        grouped.set(clase.semana, []);
      }
      grouped.get(clase.semana)!.push(clase);
    });

    const result = Array.from(grouped.entries())
      .map(([numero, clases]) => ({ numero, clases }))
      .sort((a, b) => a.numero - b.numero);

    this.semanasAgrupadas.set(result);
  }

  private setBreadcrumb(modulo: any, unidad: any) {
    this.breadcrumb.set([
      { label: 'Inicio', link: '/' },
      { label: `Módulo ${modulo.numero}`, link: `/modulo/${modulo.numero}` },
      { label: `Unidad ${unidad.numero}: ${unidad.titulo}` }
    ]);
  }
}
