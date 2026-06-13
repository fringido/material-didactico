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
import { ProtoboardTheveninNorton } from '../../../app/protoboard-thevenin-norton/protoboard-thevenin-norton';

const CLASS_TO_MODULE_UNIT: Record<number, { modulo: number; unidad: number }> = {
  1: { modulo: 1, unidad: 1 },
  2: { modulo: 1, unidad: 1 },
  3: { modulo: 1, unidad: 2 },
  4: { modulo: 1, unidad: 2 },
  5: { modulo: 1, unidad: 3 },
  6: { modulo: 1, unidad: 3 },
};

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
    ProtoboardTheveninNorton,
  ],
  templateUrl: './tema-detalle.component.html',
  styleUrls: ['./tema-detalle.component.scss']
})
export class TemaDetalleComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  modulo = signal<number>(1);
  unidad = signal<number>(1);
  clase = signal<number | null>(null);
  temaId = signal<string | null>(null);
  tema = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const claseParam = params.get('clase');
      const moduloParam = params.get('modulo');
      const unidadParam = params.get('unidad');
      const id = params.get('id');

      const claseNum = claseParam ? Number(claseParam) : null;
      if (claseNum) {
        const mapping = CLASS_TO_MODULE_UNIT[claseNum] || { modulo: 1, unidad: 1 };
        this.clase.set(claseNum);
        this.modulo.set(mapping.modulo);
        this.unidad.set(mapping.unidad);
      } else {
        this.clase.set(null);
        this.modulo.set(Number(moduloParam) || 1);
        this.unidad.set(Number(unidadParam) || 1);
      }

      this.temaId.set(id);
      this.loading.set(true);

      const m = this.modulo();
      const u = this.unidad();
      
      console.log('TemaDetalle: Loading theme', id, 'for Class', claseNum, '(Module', m, 'Unit', u, ')');

      // Prioridad: Intentar cargar desde el archivo específico de la clase si existe
      if (claseNum) {
        const classUrl = `/assets/data/clase-${claseNum}/${id}.json`;
        console.log('TemaDetalle: Attempting to load from', classUrl);
        this.http.get<any>(classUrl).subscribe({
          next: (detalle) => {
            console.log('TemaDetalle: Successfully loaded from class file', detalle);
            // Normalizar metadatos si vienen del archivo de clase
            const metadata = detalle.metadata || { clase: claseNum, id: id, titulo: detalle.nombre || detalle.titulo };
            this.tema.set({ ...detalle, metadata });
            this.loading.set(false);
          },
          error: (err) => {
            console.warn('TemaDetalle: Failed to load from class file, falling back to unit', err);
            // Fallback: Cargar desde la unidad modular
            this.cargarDesdeUnidad(m, u, id);
          }
        });
      } else {
        this.cargarDesdeUnidad(m, u, id);
      }
    });
  }

  private cargarDesdeUnidad(m: number, u: number, id: string | null) {
    const unitUrl = `/assets/data/modulo-${m}/unidad-${u}.json`;
    console.log('TemaDetalle: Attempting to load from unit file', unitUrl);
    this.http.get<any>(unitUrl).subscribe({
      next: (data) => {
        console.log('TemaDetalle: Successfully loaded unit file', data);
        const found = data.temas.find((t: any) => t.id === id);
        if (found) {
          console.log('TemaDetalle: Found theme in unit', found);
          // Normalizar contenido para el template
          const normalizedTema = found.contenido ? { ...found, ...found.contenido } : { ...found };
          this.tema.set(normalizedTema);
        } else {
          console.error('TemaDetalle: Theme not found in unit', id);
          this.error.set(`Tema "${id}" no encontrado.`);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('TemaDetalle: Failed to load unit file', err);
        this.error.set(`No se pudo cargar la información de la Unidad ${u}.`);
        this.loading.set(false);
      }
    });
  }

  chartType(inter: { chartType?: string }): ChartType {
    return (inter.chartType as ChartType) || 'ohm';
  }

  onImageError(event: Event, src: string): void {
    console.error('Error loading image:', src, event);
  }

  getVariablesForFormula(formula: any): any[] {
    const tooltipId = formula?.variables_tooltip;
    if (!tooltipId || !this.tema()?.variables_tooltips) return [];
    return this.tema().variables_tooltips[tooltipId] || [];
  }

  formulaChartType(formula?: string): ChartType {
    if (!formula) return 'ohm';
    const normalized = formula.toLowerCase();
    if (normalized.includes('v = i') || normalized.includes('i = v') || normalized.includes('voltage') || normalized.includes('corriente') || normalized.includes('resistencia')) {
      return 'ohm';
    }
    if (normalized.includes('x_c') || normalized.includes('capacitor') || normalized.includes('c =') || normalized.includes('xc')) {
      return 'capacitor_reactance';
    }
    if (normalized.includes('x_l') || normalized.includes('inductor') || normalized.includes('l =') || normalized.includes('xl')) {
      return 'inductor_reactance';
    }
    return 'ohm';
  }

  get backLink(): string {
    return this.clase() ? `/clase/${this.clase()}` : `/modulo/${this.modulo()}/unidad/${this.unidad()}`;
  }

  get backLabel(): string {
    return this.clase() ? `Volver a Clase ${this.clase()}` : `Volver a Unidad ${this.unidad()}`;
  }
}
