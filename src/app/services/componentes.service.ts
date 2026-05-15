import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { ElectronicData, Categoria, Componente, ColorBand, Subtipo } from '../models/componentes.model';

@Injectable({
  providedIn: 'root',
})
export class ComponentesService {
  /** Ruta al archivo JSON */
  private readonly JSON_URL = '/assets/data/componentes.json';

  /** Caché compartida */
  private data$!: Observable<ElectronicData>;

  constructor(private http: HttpClient) {
    this.data$ = this.http
      .get<ElectronicData>(this.JSON_URL)
      .pipe(shareReplay(1));
  }

  // ── Datos completos ────────────────────────────────────────

  /** Retorna el objeto raíz completo */
  getData(): Observable<ElectronicData> {
    return this.data$;
  }

  // ── Metadata ───────────────────────────────────────────────

  getMetadata() {
    return this.data$.pipe(
      map((d) => d.electronicComponents.metadata)
    );
  }

  // ── Comparación Activos vs Pasivos ─────────────────────────

  getComparison() {
    return this.data$.pipe(
      map((d) => d.electronicComponents.comparison)
    );
  }

  // ── Categorías (Activos / Pasivos) ─────────────────────────

  /** Todas las categorías */
  getCategories(): Observable<Categoria[]> {
    return this.data$.pipe(
      map((d) => d.electronicComponents.categories)
    );
  }

  /** Una categoría por id: 'activos' | 'pasivos' */
  getCategoryById(id: string): Observable<Categoria | undefined> {
    return this.data$.pipe(
      map((d) =>
        d.electronicComponents.categories.find((c) => c.id === id)
      )
    );
  }

  // ── Componentes ────────────────────────────────────────────

  /** Todos los componentes activos */
  getActiveComponents(): Observable<Componente[]> {
    return this.data$.pipe(
      map(
        (d) =>
          d.electronicComponents.categories.find((c) => c.id === 'activos')
            ?.componentes ?? []
      )
    );
  }

  /** Todos los componentes pasivos */
  getPassiveComponents(): Observable<Componente[]> {
    return this.data$.pipe(
      map(
        (d) =>
          d.electronicComponents.categories.find((c) => c.id === 'pasivos')
            ?.componentes ?? []
      )
    );
  }

  /** Busca un componente por id en cualquier categoría */
  getComponentById(id: string): Observable<Componente | undefined> {
    return this.data$.pipe(
      map((d) => {
        for (const cat of d.electronicComponents.categories) {
          const found = cat.componentes.find((c) => c.id === id);
          if (found) return found;
        }
        return undefined;
      })
    );
  }

  // ── Diodos (subcomponente de activos) ──────────────────────

  getDiode(): Observable<Componente | undefined> {
    return this.getComponentById('diodo');
  }

  getDiodeSubtypes(): Observable<Subtipo[]> {
    return this.getDiode().pipe(
      map((d) => d?.subtipos ?? [])
    );
  }

  getDiodeSubtypeById(id: string): Observable<Subtipo | undefined> {
    return this.getDiodeSubtypes().pipe(
      map((subs) => subs.find((s) => s.id === id))
    );
  }

  // ── Transistores ───────────────────────────────────────────

  getTransistor(): Observable<Componente | undefined> {
    return this.getComponentById('transistor');
  }

  getTransistorFamilies(): Observable<any[]> {
    return this.getTransistor().pipe(
      map((t) => t?.familias ?? [])
    );
  }

  // ── Resistencias / Código de Colores ───────────────────────

  getResistor(): Observable<Componente | undefined> {
    return this.getComponentById('resistencia');
  }

  getColorBands(): Observable<ColorBand[]> {
    return this.getResistor().pipe(
      map((r) => r?.codigo_colores?.tabla ?? [])
    );
  }

  /**
   * Calcula el valor de una resistencia a partir de tres colores.
   * @param band1 color de la primera banda
   * @param band2 color de la segunda banda
   * @param band3 color de la tercera banda (multiplicador)
   */
  calculateResistance(
    band1: string,
    band2: string,
    band3: string
  ): Observable<number | null> {
    return this.getColorBands().pipe(
      map((bands) => {
        const b1 = bands.find(
          (b) => b.color.toLowerCase() === band1.toLowerCase()
        );
        const b2 = bands.find(
          (b) => b.color.toLowerCase() === band2.toLowerCase()
        );
        const b3 = bands.find(
          (b) => b.color.toLowerCase() === band3.toLowerCase()
        );

        if (
          !b1 || b1.cifra_1 === null ||
          !b2 || b2.cifra_2 === null ||
          !b3 || b3.multiplicador === null
        ) return null;

        const value = (b1.cifra_1 * 10 + b2.cifra_2) * b3.multiplicador;
        return value;
      })
    );
  }

  // ── Capacitores ────────────────────────────────────────────

  getCapacitor(): Observable<Componente | undefined> {
    return this.getComponentById('capacitor');
  }

  getCapacitorTypes(): Observable<any[]> {
    return this.getCapacitor().pipe(
      map((c) => c?.tipos ?? [])
    );
  }

  // ── Inductores ─────────────────────────────────────────────

  getInductor(): Observable<Componente | undefined> {
    return this.getComponentById('inductor');
  }

  getInductorCoreTypes(): Observable<any[]> {
    return this.getInductor().pipe(
      map((i) => i?.tipos_por_nucleo ?? [])
    );
  }

  // ── Otros componentes ──────────────────────────────────────

  getOtherComponents(): Observable<Componente[]> {
    return this.data$.pipe(
      map((d) => d.electronicComponents.otros_componentes)
    );
  }

  // ── Tabla comparativa de frecuencia ───────────────────────

  getFrequencyTable() {
    return this.data$.pipe(
      map((d) => d.electronicComponents.tabla_comparativa_frecuencia)
    );
  }

  // ── Aplicaciones en sistemas analógicos ───────────────────

  getAnalogApplications() {
    return this.data$.pipe(
      map((d) => d.electronicComponents.aplicaciones_sistemas_analogicos)
    );
  }
}
