import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EquationChartComponent, ChartType } from '../../../components/equation-chart/equation-chart.component';
import { KatexDirective } from '../../../directives/katex.directive';
import { ShockleyLabComponent } from '../../../components/shockley-lab/shockley-lab.component';
import { TransformerSimulatorComponent } from '../../../components/circuit-simulator/transformer-simulator.component';
import { PotentiometerSimulatorComponent } from '../../../components/circuit-simulator/potentiometer-simulator.component';
import { AmplifierLabComponent } from '../../../components/amplifier-lab/amplifier-lab.component';
import { ComponentSymbolsComponent } from '../../../components/component-symbols/component-symbols.component';
import { CircuitBuilderComponent } from '../../../components/circuit-builder/circuit-builder.component';
import { PageBackBarComponent } from '../../../components/page-back-bar/page-back-bar.component';
import { DynamicCircuitSimulatorComponent } from '../../../components/dynamic-circuit-simulator/dynamic-circuit-simulator.component';

@Component({
  selector: 'app-componente-detalle',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    EquationChartComponent, 
    KatexDirective, 
    ShockleyLabComponent, 
    TransformerSimulatorComponent, 
    PotentiometerSimulatorComponent, 
    AmplifierLabComponent,
    ComponentSymbolsComponent,
    CircuitBuilderComponent,
    PageBackBarComponent,
    DynamicCircuitSimulatorComponent
  ],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  componente = signal<any>(null);
  categoriaId = signal<string | null>(null);
  loading = signal(true);

  getChartForContext(context: string): { type: ChartType, title: string, equation: string } | null {
    const id = this.componente()?.id;
    if (!id) return null;

    if (id === 'resistencia' && context === 'principal') {
      return { type: 'ohm', title: 'Ley de Ohm: V vs I (varía R)', equation: 'V = I \\cdot R' };
    }
    if (id === 'capacitor' && context === 'principal') {
      return { type: 'capacitor_diff', title: 'Corriente vs Tasa de cambio de Voltaje (varía C)', equation: 'i(t) = C \\frac{dv(t)}{dt}' };
    }
    if (id === 'inductor' && context === 'principal') {
      return { type: 'inductor_diff', title: 'Voltaje vs Tasa de cambio de Corriente (varía L)', equation: 'v(t) = L \\frac{di(t)}{dt}' };
    }
    if (id === 'transistor' && context === 'principal') {
      return { type: 'bjt_gain', title: 'Ganancia BJT: IC vs IB (varía β)', equation: 'I_C = \\beta \\cdot I_B' };
    }
    if (id === 'opamp' && context === 'principal') {
      return { type: 'opamp_diff', title: 'Voltaje Salida vs Diferencia de Entrada (varía AOL)', equation: 'V_{out} = A_{OL}(V_+ - V_-)' };
    }
    if (id === 'opamp' && context === 'ganancia_inversor') {
      return { type: 'opamp_gain', title: 'Ganancia Op-Amp Inversor (varía Rf/Rin)', equation: 'A_v = -\\frac{R_f}{R_{in}}' };
    }
    if (context === 'reactancia_capacitiva') {
      return { type: 'capacitor_reactance', title: 'Reactancia Capacitiva vs Frecuencia (varía C)', equation: 'X_C = \\frac{1}{2\\pi f C}' };
    }
    if (context === 'reactancia_inductiva') {
      return { type: 'inductor_reactance', title: 'Reactancia Inductiva vs Frecuencia (varía L)', equation: 'X_L = 2\\pi f L' };
    }
    if (context === 'diodo_rectificador' || context === 'led' || context === 'diodo_schottky') {
      return { type: 'diode_iv', title: 'Curva Característica I-V del Diodo', equation: 'I_D = I_S \\left(e^{\\frac{V_D}{V_T}} - 1\\right)' };
    }
    if (context === 'diodo_zener') {
      return { type: 'zener_iv', title: 'Curva Característica Zener (varía Vz)', equation: 'V_{salida} = V_Z' };
    }
    if (context === 'diodo_varactor') {
      return { type: 'varactor_cv', title: 'Capacitancia vs Voltaje Inverso (varía C₀)', equation: 'C_j = \\frac{C_0}{\\left(1 + \\frac{V_R}{\\phi}\\right)^n}' };
    }
    if (context === 'fotodiodo') {
      return { type: 'photodiode_iv', title: 'Fotocorriente vs Potencia Óptica (varía Responsividad)', equation: 'I_{foto} = R_\\lambda \\cdot P_{opt}' };
    }
    return null;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.categoriaId.set(params.get('categoria'));
      const id = params.get('id');
      if (id) {
        this.http.get<any>('/assets/data/componentes.json').subscribe({
          next: (data) => {
            let found: any = null;

            for (const cat of data.electronicComponents.categories) {
              found = cat.componentes.find((c: any) => c.id === id);
              if (found) break;
            }

            if (!found && data.electronicComponents.otros_componentes) {
              found = data.electronicComponents.otros_componentes.find((c: any) => c.id === id);
            }

            this.componente.set(found);
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      }
    });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
