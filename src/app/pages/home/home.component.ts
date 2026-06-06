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
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  planData = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  searchResults = signal<any[]>([]);

  readonly classIndex = [
    {
      label: 'Clase 1',
      title: 'Introducción a la Electrónica Analógica',
      route: '/clase/1',
      temas: [
        { nombre: 'Conceptos Básicos de Electrónica Analógica', route: '/clase/1/tema/conceptos-basicos' },
        { nombre: 'Componentes Electrónicos', route: '/clase/1/tema/componentes-electronicos' },
        { nombre: 'Circuitos Básicos', route: '/clase/1/tema/circuitos-basicos' }
      ]
    },
    {
      label: 'Clase 2',
      title: 'Amplificadores Operacionales',
      route: '/clase/2',
      temas: [
        { nombre: 'Componentes Electrónicos', route: '/clase/2/tema/componentes-electronicos' },
        { nombre: 'Configuraciones Básicas Op-Amp', route: '/clase/2/tema/configuraciones-opamp' },
        { nombre: 'Filtros Activos', route: '/clase/2/tema/filtros-activos' }
      ]
    },
    {
      label: 'Clase 3',
      title: 'Análisis de Circuitos en DC',
      route: '/clase/3',
      temas: [
        { nombre: 'La Ley de Ohm', route: '/clase/3/tema/ley-de-ohm' },
        { nombre: 'Tipos de Circuitos', route: '/clase/3/tema/tipos-circuitos' },
        { nombre: 'Leyes de Kirchhoff', route: '/clase/3/tema/leyes-kirchhoff' }
      ]
    },
    {
      label: 'Clase 4',
      title: 'Análisis de Nodos y Mallas',
      route: '/clase/4',
      temas: [
        { nombre: 'Resistencia Equivalente', route: '/clase/4/tema/resistencia-equivalente' },
        { nombre: 'Nodos y Mallas', route: '/clase/4/tema/nodos-mallas' },
        { nombre: 'Thevenin y Norton', route: '/clase/4/tema/thevenin-norton' },
        { nombre: 'Máxima Transferencia de Potencia', route: '/clase/4/tema/maximum-power-transfer' },
        { nombre: 'Selección del Método', route: '/clase/4/tema/seleccion-metodo' }
      ]
    },
    {
      label: 'Clase AC',
      title: 'Análisis de Circuitos en AC',
      route: '/clase/ac',
      temas: [
        { nombre: 'Señales Senoidales y Fasores', route: '/clase/ac/tema/senales-ac' },
        { nombre: 'Impedancia Compleja', route: '/clase/ac/tema/impedancia-compleja' },
        { nombre: 'Filtros Pasivos', route: '/clase/ac/tema/filtros-pasivos' },
        { nombre: 'Diagramas de Bode', route: '/clase/ac/tema/diagramas-bode' },
        { nombre: 'Respuesta Transitoria', route: '/clase/ac/tema/respuesta-transitoria' },
        { nombre: 'Laboratorio: Filtros RC', route: '/clase/ac/tema/laboratorio-filtros' }
      ]
    },
    {
      label: 'Clase 5',
      title: 'Amplificadores y Etapas de Potencia',
      route: '/clase/5',
      temas: [
        { nombre: 'Clasificación de Amplificadores', route: '/clase/5/tema/clasificacion-amplificadores' },
        { nombre: 'Configuraciones BJT', route: '/clase/5/tema/configuraciones-bjt' },
        { nombre: 'Etapas de Potencia', route: '/clase/5/tema/etapas-potencia' },
        { nombre: 'Thevenin y Norton', route: '/clase/5/tema/thevenin-norton' }
      ]
    },
    {
      label: 'Clase 6',
      title: 'Osciladores y Generadores de Señales',
      route: '/clase/6',
      temas: [
        { nombre: 'Osciladores RC', route: '/clase/6/tema/osciladores-rc' },
        { nombre: 'Osciladores LC', route: '/clase/6/tema/osciladores-lc' },
        { nombre: 'Oscilador con Timer 555', route: '/clase/6/tema/oscilador-555' }
      ]
    }
  ];

  ngOnInit() {
    this.http.get<any>('/assets/data/planDeEstudio.json').subscribe({
      next: (data) => {
        if (data?.plan_de_estudio) {
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

  onSearch(query: string) {
    this.searchQuery.set(query);
    if (!query || query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    const results: any[] = [];
    const data = this.planData();
    if (!data) return;

    const q = query.toLowerCase();

    // Search in modules and units
    data.modulos?.forEach((mod: any) => {
      mod.unidades?.forEach((unidad: any) => {
        // Search unit title
        if (unidad.titulo?.toLowerCase().includes(q)) {
          results.push({
            type: 'unidad',
            title: unidad.titulo,
            description: unidad.temas?.map((t: any) => t.nombre).join(', '),
            route: `/modulo/${mod.numero}/unidad/${unidad.numero}`,
            module: mod.numero,
            unit: unidad.numero
          });
        }

        // Search in unit topics
        unidad.temas?.forEach((tema: any) => {
          if (tema.nombre?.toLowerCase().includes(q) || tema.descripcion?.toLowerCase().includes(q)) {
            results.push({
              type: 'tema',
              title: tema.nombre,
              description: tema.descripcion,
              route: tema.ruta || `/modulo/${mod.numero}/unidad/${unidad.numero}/tema/${tema.id}`,
              module: mod.numero,
              unit: unidad.numero
            });
          }
        });

        // Search in unit topics
        unidad.temas?.forEach((tema: any) => {
          if (tema.nombre?.toLowerCase().includes(q) || tema.descripcion?.toLowerCase().includes(q)) {
            results.push({
              type: 'tema',
              title: tema.nombre,
              description: tema.descripcion,
              route: tema.ruta || `/clase/${unidad.numero}/tema/${tema.id}`,
              module: mod.numero,
              unit: unidad.numero
            });
          }
        });
      });
    });

    // Search in exercise bank
    if (data.banco_ejercicios) {
      Object.entries(data.banco_ejercicios).forEach(([category, exercises]: [string, any]) => {
        exercises.forEach((ex: any) => {
          if (ex.descripcion?.toLowerCase().includes(q)) {
            results.push({
              type: 'ejercicio',
              title: `Ejercicio ${ex.numero}`,
              description: ex.descripcion,
              route: '/componentes/nodos-mallas',
              category: category
            });
          }
        });
      });
    }

    // Search in projects
    data.proyectos_integradores?.forEach((proj: any) => {
      if (proj.titulo?.toLowerCase().includes(q) || proj.objetivo?.toLowerCase().includes(q)) {
        results.push({
          type: 'proyecto',
          title: proj.titulo,
          description: proj.objetivo,
          route: '/sistemas'
        });
      }
    });

    this.searchResults.set(results.slice(0, 10));
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
