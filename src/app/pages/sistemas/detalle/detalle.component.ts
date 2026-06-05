import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../../directives/katex.directive';
import { FormulaTooltipDirective } from '../../../directives/formula-tooltip.directive';
import { PageBackBarComponent } from '../../../components/page-back-bar/page-back-bar.component';
import { AmplifierSimulatorComponent } from '../../../components/circuit-simulator/amplifier-simulator.component';
import { FilterSimulatorComponent } from '../../../components/circuit-simulator/filter-simulator.component';
import { OscillatorSimulatorComponent } from '../../../components/circuit-simulator/oscillator-simulator.component';
import { PotentiometerSimulatorComponent } from '../../../components/circuit-simulator/potentiometer-simulator.component';
import { TransformerSimulatorComponent } from '../../../components/circuit-simulator/transformer-simulator.component';

@Component({
  selector: 'app-sistema-detalle',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    KatexDirective, 
    FormulaTooltipDirective, 
    PageBackBarComponent,
    AmplifierSimulatorComponent,
    FilterSimulatorComponent,
    OscillatorSimulatorComponent,
    PotentiometerSimulatorComponent,
    TransformerSimulatorComponent
  ],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class SistemaDetalleComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

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
              const normalizedTipoId = tipoId?.replace(/^opamp\/?/, '').replace(/^opamp/, '');
              found = sistemaData.configuraciones.find((c: any) => c.id === tipoId);
              if (!found) {
                found = sistemaData.opamps.tipos.find((t: any) => t.id === tipoId || t.id === normalizedTipoId);
                if (found) found.categoria = 'Op-Amp';
              } else {
                found.categoria = 'Configuración BJT';
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
    return key
      .replace(/_/g, ' ')
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
  }
}
