import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';

interface SymbolDefinition {
  [key: string]: string;
}

interface VariableDefinition {
  simbolo: string;
  nombre: string;
  unidad: string;
  descripcion: string;
}

@Directive({
  selector: '[appFormulaTooltip]',
  standalone: true
})
export class FormulaTooltipDirective implements OnInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() symbols: SymbolDefinition = {};
  @Input() variables: VariableDefinition[] = [];

  // Diccionario global de símbolos comunes
  private commonSymbols: SymbolDefinition = {
    // Voltajes
    'V': 'Voltaje',
    'V_{out}': 'Voltaje de salida',
    'V_{in}': 'Voltaje de entrada',
    'V_+': 'Voltaje en entrada no inversora',
    'V_-': 'Voltaje en entrada inversora',
    'V_{CE}': 'Voltaje colector-emisor',
    'V_{CC}': 'Voltaje de alimentación',
    'V_D': 'Voltaje en el diodo',
    'V_T': 'Voltaje térmico (≈26mV a 25°C)',
    'V_Z': 'Voltaje Zener',
    'V_{OS}': 'Voltaje de offset',
    'V_1': 'Voltaje de entrada 1',
    'V_2': 'Voltaje de entrada 2',
    
    // Corrientes
    'I': 'Corriente',
    'I_C': 'Corriente de colector',
    'I_B': 'Corriente de base',
    'I_E': 'Corriente de emisor',
    'I_D': 'Corriente en el diodo',
    'I_S': 'Corriente de saturación',
    'I_{foto}': 'Fotocorriente',
    
    // Resistencias
    'R': 'Resistencia',
    'R_C': 'Resistencia de colector',
    'R_E': 'Resistencia de emisor',
    'R_f': 'Resistencia de realimentación',
    'R_{in}': 'Resistencia de entrada',
    'r_e': 'Resistencia dinámica del emisor',
    'R_1': 'Resistencia 1',
    'R_2': 'Resistencia 2',
    
    // Capacitancia e Inductancia
    'C': 'Capacitancia',
    'L': 'Inductancia',
    'C_1': 'Capacitor 1',
    'C_2': 'Capacitor 2',
    'C_{eq}': 'Capacitancia equivalente',
    'L_{eq}': 'Inductancia equivalente',
    'C_j': 'Capacitancia de unión',
    
    // Impedancias
    'Z': 'Impedancia',
    'Z_{in}': 'Impedancia de entrada',
    'Z_{out}': 'Impedancia de salida',
    'X_C': 'Reactancia capacitiva',
    'X_L': 'Reactancia inductiva',
    
    // Ganancias
    'A': 'Ganancia',
    'A_v': 'Ganancia de voltaje',
    'A_{OL}': 'Ganancia de lazo abierto',
    'β': 'Beta - Ganancia de corriente del transistor',
    '\\beta': 'Beta - Ganancia de corriente del transistor',
    
    // Frecuencias
    'f': 'Frecuencia',
    'f_c': 'Frecuencia de corte',
    'f_0': 'Frecuencia central o de resonancia',
    'f_H': 'Frecuencia superior',
    'f_L': 'Frecuencia inferior',
    '\\omega': 'Omega - Frecuencia angular (ω = 2πf)',
    'ω': 'Omega - Frecuencia angular (ω = 2πf)',
    '\\omega_0': 'Frecuencia angular de resonancia',
    
    // Factor de calidad
    'Q': 'Factor de calidad',
    'BW': 'Ancho de banda',
    
    // Funciones de transferencia
    'H(j\\omega)': 'Función de transferencia en frecuencia',
    'H(s)': 'Función de transferencia en dominio de Laplace',
    's': 'Variable compleja de Laplace',
    'j': 'Unidad imaginaria (j² = -1)',
    
    // Tiempo
    't': 'Tiempo',
    'dt': 'Diferencial de tiempo',
    
    // Constantes matemáticas
    '\\pi': 'Pi (≈3.14159)',
    'e': 'Número de Euler (≈2.71828)',
    
    // Otros
    'n': 'Número entero o factor de idealidad',
    'SR': 'Slew Rate - Velocidad de cambio',
    'CMRR': 'Relación de rechazo de modo común',
    'GBW': 'Producto ganancia-ancho de banda'
  };

  ngOnInit() {
    // Convertir variables del formato JSON a SymbolDefinition
    const variableSymbols: SymbolDefinition = {};
    this.variables.forEach(v => {
      variableSymbols[v.simbolo] = `${v.nombre} (${v.unidad}): ${v.descripcion}`;
    });

    // Combinar símbolos comunes con símbolos específicos y variables
    const allSymbols = { ...this.commonSymbols, ...this.symbols, ...variableSymbols };

    // Esperar a que KaTeX renderice
    setTimeout(() => {
      this.addTooltips(allSymbols);
    }, 100);
  }

  private addTooltips(symbols: SymbolDefinition) {
    const element = this.el.nativeElement;
    
    // Buscar todos los elementos renderizados por KaTeX
    const mathElements = element.querySelectorAll('.katex');
    
    mathElements.forEach((mathEl: Element) => {
      // Buscar todos los elementos que contienen símbolos
      const symbolElements = mathEl.querySelectorAll('.mord, .mbin, .mrel, .mop');
      
      symbolElements.forEach((symEl: Element) => {
        const text = symEl.textContent?.trim();
        
        if (text && symbols[text]) {
          this.makeInteractive(symEl as HTMLElement, text, symbols[text]);
        }
      });

      // También buscar subíndices y superíndices
      const subscripts = mathEl.querySelectorAll('.vlist-t');
      subscripts.forEach((subEl: Element) => {
        const fullText = this.extractFullSymbol(subEl);
        if (fullText && symbols[fullText]) {
          this.makeInteractive(subEl as HTMLElement, fullText, symbols[fullText]);
        }
      });
    });
  }

  private extractFullSymbol(element: Element): string {
    // Extraer el símbolo completo incluyendo subíndices
    const text = element.textContent?.trim() || '';
    return text;
  }

  private makeInteractive(element: HTMLElement, symbol: string, definition: string) {
    // Agregar clase para cursor pointer
    this.renderer.setStyle(element, 'cursor', 'help');
    this.renderer.setStyle(element, 'position', 'relative');
    this.renderer.setStyle(element, 'display', 'inline-block');
    
    // Crear tooltip
    const tooltip = this.renderer.createElement('span');
    this.renderer.addClass(tooltip, 'formula-tooltip');
    
    const tooltipText = this.renderer.createText(definition);
    this.renderer.appendChild(tooltip, tooltipText);
    this.renderer.appendChild(element, tooltip);

    // Agregar eventos hover
    this.renderer.listen(element, 'mouseenter', () => {
      this.renderer.addClass(tooltip, 'formula-tooltip--visible');
    });

    this.renderer.listen(element, 'mouseleave', () => {
      this.renderer.removeClass(tooltip, 'formula-tooltip--visible');
    });
  }
}
