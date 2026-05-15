import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../../directives/katex.directive';

@Component({
  selector: 'app-sistema-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, KatexDirective],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class SistemaDetalleComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private titleCase = inject(TitleCasePipe);

  sistema = signal<string | null>(null);
  tipo = signal<string | null>(null);
  detalle = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.sistema.set(params.get('sistema'));
      this.tipo.set(params.get('tipo'));
      
      this.http.get<any>('/assets/data/sistemas.json').subscribe({
        next: (data) => {
          const sistemas = data.sistemas_analogos;
          const sistemaKey = this.sistema();
          const tipoId = this.tipo();
          
          if (sistemaKey && sistemas[sistemaKey]) {
            const sistemaData = sistemas[sistemaKey];
            let found: any = null;

            if (sistemaKey === 'amplificadores') {
              if (tipoId?.startsWith('opamp')) {
                const opampId = tipoId.replace('opamp/', '');
                found = sistemaData.opamps.tipos.find((t: any) => t.id === opampId);
                if (found) found.categoria = 'Op-Amp';
              } else {
                found = sistemaData.configuraciones.find((c: any) => c.id === tipoId);
                if (found) found.categoria = 'Configuración BJT';
              }
            } else if (sistemaKey === 'filtros') {
              found = sistemaData.por_frecuencia.find((f: any) => f.id === tipoId);
              if (found) found.categoria = 'Filtro';
            } else if (sistemaKey === 'osciladores') {
              found = sistemaData.tipos.find((o: any) => o.id === tipoId);
              if (found) found.categoria = 'Oscilador';
            }

            this.detalle.set(found);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatLabel(key: string): string {
    return this.titleCase.transform(key.replace(/_/g, ' '));
  }
}
