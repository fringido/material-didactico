import { Component, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KatexDirective } from '../../directives/katex.directive';

export interface ElectronicSymbol {
  id: string;
  nombre: string;
  categoria: 'pasivo' | 'activo';
  ecuacion: string;
  terminales: string[];
  descripcion: string;
  unidad: string;
  color: string;
}

@Component({
  selector: 'app-component-symbols',
  standalone: true,
  imports: [CommonModule, KatexDirective],
  templateUrl: './component-symbols.component.html',
  styleUrls: ['./component-symbols.component.scss']
})
export class ComponentSymbolsComponent {
  /** Optionally filter to show only a specific symbol */
  @Input() filterId: string | null = null;

  selectedSymbol = signal<string | null>(null);

  symbols: ElectronicSymbol[] = [
    {
      id: 'resistencia',
      nombre: 'Resistencia',
      categoria: 'pasivo',
      ecuacion: 'V = I \\cdot R',
      terminales: ['Terminal 1', 'Terminal 2'],
      descripcion: 'Componente que se opone al flujo de corriente eléctrica, convirtiendo energía eléctrica en calor. Su valor se mide en ohmios (Ω).',
      unidad: 'Ω (Ohm)',
      color: '#8B5CF6'
    },
    {
      id: 'capacitor',
      nombre: 'Capacitor',
      categoria: 'pasivo',
      ecuacion: 'i(t) = C \\frac{dv(t)}{dt}',
      terminales: ['Terminal +', 'Terminal −'],
      descripcion: 'Almacena energía en un campo eléctrico entre dos placas conductoras separadas por un dieléctrico. Bloquea DC y permite el paso de AC.',
      unidad: 'F (Faradio)',
      color: '#3B82F6'
    },
    {
      id: 'inductor',
      nombre: 'Inductor',
      categoria: 'pasivo',
      ecuacion: 'v(t) = L \\frac{di(t)}{dt}',
      terminales: ['Terminal 1', 'Terminal 2'],
      descripcion: 'Almacena energía en un campo magnético cuando circula corriente. Se opone a cambios bruscos de corriente.',
      unidad: 'H (Henrio)',
      color: '#10B981'
    },
    {
      id: 'diodo',
      nombre: 'Diodo',
      categoria: 'activo',
      ecuacion: 'I_D = I_S \\left(e^{\\frac{V_D}{nV_T}} - 1\\right)',
      terminales: ['Ánodo', 'Cátodo'],
      descripcion: 'Dispositivo semiconductor que permite el flujo de corriente en una sola dirección (polarización directa). Usado en rectificación y protección.',
      unidad: 'V (caída)',
      color: '#EF4444'
    },
    {
      id: 'transistor',
      nombre: 'Transistor BJT',
      categoria: 'activo',
      ecuacion: 'I_C = \\beta \\cdot I_B',
      terminales: ['Base', 'Colector', 'Emisor'],
      descripcion: 'Dispositivo semiconductor de 3 terminales usado para amplificación y conmutación. La corriente de base controla la corriente de colector.',
      unidad: 'β (ganancia)',
      color: '#F59E0B'
    },
    {
      id: 'opamp',
      nombre: 'Op-Amp',
      categoria: 'activo',
      ecuacion: 'V_{out} = A_{OL}(V_+ - V_-)',
      terminales: ['V+', 'V−', 'Vout', 'V+cc', 'V−cc'],
      descripcion: 'Amplificador operacional de alta ganancia con entrada diferencial. Ideal para amplificación, filtrado, comparación y operaciones matemáticas.',
      unidad: 'A_OL (ganancia)',
      color: '#06B6D4'
    },
    {
      id: 'transformador',
      nombre: 'Transformador',
      categoria: 'pasivo',
      ecuacion: '\\frac{V_1}{V_2} = \\frac{N_1}{N_2}',
      terminales: ['Primario +', 'Primario −', 'Secundario +', 'Secundario −'],
      descripcion: 'Dispositivo que transfiere energía eléctrica entre dos circuitos mediante inducción electromagnética, pudiendo aumentar o disminuir el voltaje.',
      unidad: 'Relación N₁/N₂',
      color: '#EC4899'
    },
    {
      id: 'potenciometro',
      nombre: 'Potenciómetro',
      categoria: 'pasivo',
      ecuacion: 'V_{out} = V_{in} \\cdot \\frac{R_2}{R_1 + R_2}',
      terminales: ['Terminal 1', 'Cursor', 'Terminal 2'],
      descripcion: 'Resistencia variable de 3 terminales. El cursor divide la resistencia total, permitiendo ajustar voltaje o corriente de forma continua.',
      unidad: 'Ω (variable)',
      color: '#84CC16'
    }
  ];

  get displaySymbols(): ElectronicSymbol[] {
    if (this.filterId) {
      return this.symbols.filter(s => s.id === this.filterId);
    }
    return this.symbols;
  }

  selectSymbol(id: string) {
    this.selectedSymbol.set(this.selectedSymbol() === id ? null : id);
  }

  getSymbol(id: string): ElectronicSymbol | undefined {
    return this.symbols.find(s => s.id === id);
  }
}
