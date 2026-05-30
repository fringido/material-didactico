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
    
    // Componentes electrónicos
    if (t.includes('componentes') || t.includes('características') || t.includes('propiedades')) return '/componentes';
    
    // Circuitos básicos: amplificadores, filtros, osciladores
    if (t.includes('amplificadores') || t.includes('filtros') || t.includes('osciladores')) return '/sistemas';
    if (t.includes('circuitos básicos')) return '/sistemas';
    
    // Clase 3 — Análisis DC
    if (t.includes('ohm')) return '/clase/3/tema/ley-de-ohm';
    if (t.includes('kirchhoff') || t.includes('teoremas fundamentales')) return '/clase/3';
    if (t.includes('resistencia equivalente') || t.includes('equivalente') || t.includes('serie') || t.includes('paralelo')) return '/clase/4/tema/resistencia-equivalente';
    if (t.includes('nodos') || t.includes('mallas')) return '/clase/4';
    if (t.includes('máxima transferencia') || t.includes('maximum power') || t.includes('potencia máxima')) return '/clase/4/tema/maximum-power-transfer';
    if (t.includes('thevenin') || t.includes('norton')) return '/clase/4/tema/maximum-power-transfer';
    if (t.includes('resistencias equivalentes') || t.includes('corrientes, voltajes')) return '/clase/3/tema/tipos-circuitos';
    if (t.includes('leyes y teoremas')) return '/clase/3';

    // Componentes específicos
    if (t.includes('diodos')) return '/componentes/activos/diodo';
    if (t.includes('transistor') || t.includes('bjt') || t.includes('mosfet')) return '/componentes/activos/transistor';
    if (t.includes('op-amp') || t.includes('operacional')) return '/componentes/activos/opamp';
    
    // Componentes pasivos
    if (t.includes('resistencia')) return '/componentes/pasivos/resistencia';
    if (t.includes('capacitor')) return '/componentes/pasivos/capacitor';
    if (t.includes('inductor') || t.includes('bobina')) return '/componentes/pasivos/inductor';
    
    // Otros componentes
    if (t.includes('transformador')) return '/componentes/otros/transformador';
    if (t.includes('potenciómetro') || t.includes('potenciometro')) return '/componentes/otros/potenciometro';
    
    return null;
  }
}
