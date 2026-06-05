import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';
import { EquationChartComponent } from '../../components/equation-chart/equation-chart.component';

@Component({
  selector: 'app-clase5',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    PageBackBarComponent
  ],
  template: `
<div class="page-shell clase5-page">
  @if (loading()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando Clase 5…</p>
    </div>
  } @else if (error()) {
    <app-page-back-bar backLink="/" backLabel="Volver al inicio" />
    <div class="content-panel mt-4">
      <p class="text-body">{{ error() }}</p>
    </div>
  } @else if (data() || temaDetallado()) {
    <app-page-back-bar backLink="/clase/5" backLabel="Volver a Clase 5" [breadcrumb]="[
        { label: 'Inicio', link: '/' },
        { label: 'Clase 5', link: '/clase/5' },
        { label: temaDetallado()?.nombre || 'Tema' }
      ]" />

    @if (data()) {
      <header class="page-hero">
        <span class="badge badge--primary badge--lg">Clase {{ data().metadata.clase }}</span>
        <h1 class="page-hero__title">{{ data().metadata.titulo }}</h1>
        <p class="page-hero__lead">{{ data().metadata.descripcion }}</p>
        <div class="flex gap-3 mt-3">
          <a [routerLink]="data().rutas_relacionadas?.unidad_completa || '/modulo/1/unidad/3'"
             class="btn btn--ghost btn--sm">
            Ver unidad completa (Módulo 1) →
          </a>
          @if (data().rutas_relacionadas?.siguiente_clase) {
            <a [routerLink]="data().rutas_relacionadas.siguiente_clase" class="btn btn--primary btn--sm">
              Siguiente: Clase 6 →
            </a>
          }
        </div>
      </header>

      @if (data().objetivos?.length) {
        <section class="section">
          <h2 class="section__title">Objetivos de aprendizaje</h2>
          <div class="content-panel">
            <ul class="text-body bullet-list">
              <li *ngFor="let o of data().objetivos">{{ o }}</li>
            </ul>
          </div>
        </section>
      }

      <section class="section">
        <h2 class="section__title">Temas de la sesión</h2>
        <div class="content-grid">
          @for (tema of data().temas; track tema.id) {
            <a [routerLink]="['/clase/5/tema', tema.id]" class="card card--bordered theme-card">
              <span class="theme-card__icon">{{ tema.icono }}</span>
              <h3 class="theme-card__title">{{ tema.nombre }}</h3>
              <p class="theme-card__desc">{{ tema.descripcion }}</p>
            </a>
          }
        </div>
      </section>
    }

    @if (temaDetallado()) {
      <section class="section tema-section">
        <div class="tema-header">
          @if (temaDetallado().icono) {
            <span class="tema-icon">{{ temaDetallado().icono }}</span>
          }
          <div>
            <h2 class="section__title">{{ temaDetallado().nombre }}</h2>
            <p class="text-secondary">{{ temaDetallado().descripcion }}</p>
          </div>
        </div>

        @if (temaDetallado().detalle?.introduccion) {
          <div class="content-panel">
            <p class="text-body">{{ temaDetallado().detalle.introduccion }}</p>
          </div>
        }

        <!-- Conceptos clave -->
        @if (temaDetallado().detalle?.conceptos_clave?.length) {
          <section class="section">
            <h3 class="section__title">Conceptos Clave</h3>
            <div class="content-grid">
              @for (c of temaDetallado().detalle.conceptos_clave; track c.nombre) {
                <div class="formula-card card card--bordered">
                  <p class="formula-card__label">{{ c.nombre }}</p>
                  <p class="text-body">{{ c.descripcion }}</p>
                  @if (c.principio_fisico) {
                    <p class="formula-card__desc"><strong>Principio:</strong> {{ c.principio_fisico }}</p>
                  }
                  @if (c.cuando_usarlo) {
                    <p class="formula-card__desc"><strong>Cuándo usarlo:</strong> {{ c.cuando_usarlo }}</p>
                  }
                </div>
              }
            </div>
          </section>
        }

        <!-- Fórmulas -->
        @if (temaDetallado().detalle?.formulas?.length) {
          <section class="section">
            <h3 class="section__title">Fórmulas</h3>
            <div class="content-grid content-grid--3">
              @for (f of temaDetallado().detalle.formulas; track f.titulo) {
                <div class="formula-card card card--bordered">
                  <p class="formula-card__label">{{ f.titulo }}</p>
                  <div class="equation-display equation-display--sm" [appKatex]="f.katex"></div>
                </div>
              }
            </div>
          </section>
        }

        <!-- Ejercicios Prácticos -->
        @if (temaDetallado().detalle?.ejercicios?.length) {
          <section class="section">
            <h3 class="section__title">Ejercicios Prácticos</h3>
            <div class="exercises-list">
              @for (ej of temaDetallado().detalle.ejercicios; track ej.id) {
                <div class="exercise-card card card--bordered">
                  <div class="exercise-card__header">
                    <h4 class="exercise-card__title">{{ ej.titulo }}</h4>
                    <span class="badge badge--info">{{ temaDetallado().nombre }}</span>
                  </div>
                  <div class="exercise-card__content">
                    <p class="text-body" [appKatex]="ej.descripcion"></p>
                    
                    @if (activeExercise() === ej.id) {
                      <div class="exercise-timer mt-3">
                        <div class="timer-display">
                          <span class="timer-icon">⏱️</span>
                          <span class="timer-value">{{ formatTime(timerRemaining()) }}</span>
                        </div>
                      </div>
                    }

                    @if (showSolution()[ej.id]) {
                      <div class="exercise-solution mt-3">
                        <h5 class="solution-title">✅ Solución:</h5>
                        <p class="text-body" [appKatex]="ej.solucion"></p>
                        <div class="solution-explanation mt-2">
                          <p class="text-secondary"><strong>Explicación:</strong> {{ ej.explicacion }}</p>
                        </div>
                      </div>
                    } @else if (activeExercise() !== ej.id) {
                      <button class="btn btn--primary btn--sm mt-3" (click)="startExerciseTimer(ej.id, ej.tiempo_minutos)">
                        Iniciar ejercicio ({{ ej.tiempo_minutos }} min)
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        }

        <!-- Secciones -->
        @if (temaDetallado().detalle?.secciones?.length) {
          @for (sec of temaDetallado().detalle.secciones; track sec.id) {
            <section class="section">
              <h3 class="section__title">{{ sec.titulo }}</h3>
              <div class="content-panel">
                <p class="text-body">{{ sec.contenido }}</p>
              </div>
            </section>
          }
        }

        <footer class="page-footer-nav">
          <app-page-back-bar backLink="/clase/5" backLabel="Volver a Clase 5" />
          <div class="nav-links mt-4">
            @for (link of temaDetallado().detalle?.enlaces; track link.ruta) {
              <a [routerLink]="link.ruta" class="btn btn--ghost btn--sm">{{ link.texto }}</a>
            }
          </div>
        </footer>
      </section>
    }
  }
</div>
  `,
  styles: [`
.clase5-page {
  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem;
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: inherit;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    &__icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    &__title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    &__desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  }

  .tema-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;

    .tema-icon {
      font-size: 3.5rem;
      background: var(--bg-secondary);
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 1rem;
    }
  }

  .exercise-card {
    margin-bottom: 1.5rem;
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    &__title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  .exercise-timer {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 0.5rem;
    display: inline-flex;
    align-items: center;
    .timer-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: monospace;
      font-size: 1.2rem;
      color: var(--color-primary);
    }
  }

  .exercise-solution {
    background: rgba(16, 185, 129, 0.1);
    padding: 1rem;
    border-left: 4px solid #10b981;
    border-radius: 0 0.5rem 0.5rem 0;
    .solution-title {
      margin: 0 0 0.5rem 0;
      color: #059669;
    }
  }

  .nav-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
}
  `]
})
export class Clase5Component implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  
  data = signal<any>(null);
  temaDetallado = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Exercise state
  activeExercise = signal<string | null>(null);
  timerRemaining = signal<number>(0);
  timerInterval: any = null;
  showSolution = signal<Record<string, boolean>>({});

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const temaId = params.get('id');
      this.loading.set(true);
      
      if (temaId) {
        this.http.get<any>(`/assets/data/clase-5/${temaId}.json`).subscribe({
          next: (detalle) => {
            this.temaDetallado.set({ id: temaId, nombre: detalle.nombre || detalle.titulo, descripcion: detalle.descripcion, detalle });
            this.data.set(null);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error loading topic', err);
            this.error.set(`No se pudo cargar el tema "${temaId}".`);
            this.loading.set(false);
          }
        });
      } else {
        this.http.get<any>('/assets/data/clase-5/index.json').subscribe({
          next: (d) => {
            this.data.set(d);
            this.temaDetallado.set(null);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudo cargar el índice de la Clase 5.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startExerciseTimer(exerciseId: string, minutes: number) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.activeExercise.set(exerciseId);
    this.timerRemaining.set(minutes * 60);
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
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.showSolution.update(s => ({ ...s, [exerciseId]: true }));
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
