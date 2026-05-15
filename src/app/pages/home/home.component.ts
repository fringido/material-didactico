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
    if (t.includes('componentes')) return '/componentes';
    if (t.includes('amplificadores') || t.includes('bjt') || t.includes('mosfet')) return '/sistemas';
    if (t.includes('filtros')) return '/sistemas';
    if (t.includes('osciladores')) return '/sistemas';
    if (t.includes('diodos')) return '/componentes/activos/diodo';
    return null;
  }
}
