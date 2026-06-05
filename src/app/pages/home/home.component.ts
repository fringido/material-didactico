import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  planData = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.http.get<any>('/assets/data/planDeEstudio.json').subscribe({
      next: (data) => {
        if (data && data.plan_de_estudio) {
          this.planData.set(data.plan_de_estudio);
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error.set('No se pudo cargar el plan de estudios.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  getRouteForTema(tema: string): string | null {
    const t = tema.toLowerCase();
    
    // Unidad 1 (Semanas 1-2)
    if (t.includes('conceptos básicos de electrónica') || t === 'conceptos básicos de electrónica analógica') return '/clase/1/tema/conceptos-basicos';
    if (t.includes('características y propiedades de los componentes')) return '/clase/2';
    if (t.includes('circuitos básicos: amplificadores')) return '/clase/1/tema/circuitos-basicos';
    
    // Unidad 2 (Semanas 3-4)
    if (t.includes('leyes y teoremas fundamentales')) return '/clase/3';
    if (t.includes('resistencia equivalente en serie')) return '/clase/4/tema/resistencia-equivalente';
    if (t.includes('métodos de análisis: nodos')) return '/clase/4/tema/nodos-mallas';
    if (t.includes('cálculo de corrientes, voltajes')) return '/clase/3/tema/tipos-circuitos';
    if (t.includes('thevenin') || t.includes('norton')) return '/clase/4/tema/thevenin-norton';
    if (t.includes('máxima transferencia') || t.includes('maximum power')) return '/clase/4/tema/maximum-power-transfer';
    
    // Unidad 3 (Semanas 5-6)
    if (t.includes('conceptos de señales y sistemas') || t.includes('señales senoidales y fasores')) return '/clase/5/tema/senales-ac';
    if (t.includes('filtros pasivos')) return '/clase/5/tema/filtros-pasivos';
    if (t.includes('respuesta en frecuencia') || t.includes('diagramas de bode')) return '/clase/6/tema/respuesta-frecuencia';
    if (t.includes('respuesta transitoria y estable') || t.includes('transitoria y estado estable')) return '/clase/6/tema/respuesta-transitoria';

    // Componentes específicos (Catalog shortcuts)
    if (t.includes('diodos')) return '/componentes/activos/diodo';
    if (t.includes('transistor') || t.includes('bjt') || t.includes('mosfet')) return '/componentes/activos/transistor';
    if (t.includes('op-amp') || t.includes('operacional')) return '/componentes/activos/opamp';
    if (t.includes('resistencia')) return '/componentes/pasivos/resistencia';
    if (t.includes('capacitor')) return '/componentes/pasivos/capacitor';
    if (t.includes('inductor') || t.includes('bobina')) return '/componentes/pasivos/inductor';
    if (t.includes('transformador')) return '/componentes/otros/transformador';
    if (t.includes('potenciómetro') || t.includes('potenciometro')) return '/componentes/otros/potenciometro';
    
    // Fallback general parsing
    if (t.includes('componentes') || t.includes('características') || t.includes('propiedades')) return '/componentes';
    if (t.includes('amplificadores') || t.includes('filtros') || t.includes('osciladores')) return '/sistemas';
    if (t.includes('circuitos básicos')) return '/sistemas';
    if (t.includes('ohm')) return '/clase/3/tema/ley-de-ohm';
    if (t.includes('kirchhoff')) return '/clase/3';
    
    return null;
  }
}
