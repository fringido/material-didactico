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
    <div class="page-shell">
      <app-page-back-bar
        [backLink]="backLink()"
        [backLabel]="'Módulo ' + moduloNum()"
        [breadcrumb]="breadcrumb()"
      />

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando unidad...</p>
        </div>
      } @else if (error()) {
        <div class="content-panel">
          <p class="text-error">{{ error() }}</p>
        </div>
      } @else if (unidad()) {
        <header class="page-hero">
          <div class="flex gap-2 mb-3">
            <span class="badge badge--primary">Módulo {{ moduloNum() }}</span>
            <span class="badge badge--info">Unidad {{ unidad()!.numero }}</span>
            <span class="badge badge--neutral">Semanas {{ unidad()!.semanas }}</span>
          </div>
          <h1 class="page-hero__title">{{ unidad()!.titulo }}</h1>
          <p class="page-hero__lead">Explora el contenido detallado de esta unidad organizado por semanas y clases.</p>
        </header>

        <section class="section">
          <h2 class="section__title">Planificación Semanal</h2>
          <div class="content-grid content-grid--1">
            @for (semana of semanasAgrupadas(); track semana.numero) {
              <article class="card card--bordered">
                <div class="card__header flex justify-between items-center">
                  <h3 class="card__title">Semana {{ semana.numero }}</h3>
                  <span class="badge badge--primary badge--sm">{{ semana.clases.length }} clase(s)</span>
                </div>

                <div class="card__body flex flex-col gap-4">
                  @for (clase of semana.clases; track clase.semana + '-' + clase.clase) {
                    <div class="content-panel content-panel--bordered">
                      <h4 class="text-lg font-bold mb-1">{{ clase.tema }}</h4>
                      <p class="text-secondary text-sm mb-4">{{ clase.actividad }}</p>

                      @if (clase.temas && clase.temas.length > 0) {
                        <div class="flex flex-col gap-2">
                          @for (tema of clase.temas; track tema.id) {
                            <a [routerLink]="tema.ruta" class="page-back flex items-center justify-between w-full hover:bg-secondary">
                              <div class="flex items-center gap-3">
                                @if (tema.icono) {
                                  <span class="text-xl">{{ tema.icono }}</span>
                                }
                                <span class="font-medium">{{ tema.nombre }}</span>
                              </div>
                              <span class="text-primary-light">→</span>
                            </a>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </article>
            }
          </div>
        </section>

        @if (unidad()!.ejercicios && unidad()!.ejercicios.length > 0) {
          <section class="section">
            <h2 class="section__title">Ejercicios Propuestos</h2>
            <div class="content-grid">
              @for (ejercicio of unidad()!.ejercicios; track ejercicio.numero) {
                <div class="formula-card card card--bordered">
                  <p class="formula-card__label">Ejercicio {{ ejercicio.numero }}</p>
                  <p class="text-body">{{ ejercicio.descripcion }}</p>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: []
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
