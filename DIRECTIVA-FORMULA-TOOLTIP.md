# Directiva FormulaTooltip

## Descripción

La directiva `appFormulaTooltip` agrega tooltips interactivos a las fórmulas renderizadas con KaTeX. Al pasar el cursor sobre los símbolos matemáticos, se muestra información detallada sobre cada variable.

## Formato de Uso

### 1. Uso Básico con Símbolos Personalizados

```html
<div [appKatex]="formula" 
     appFormulaTooltip 
     [symbols]="{ 'V': 'Voltaje', 'I': 'Corriente' }"></div>
```

### 2. Uso con Variables del Formato JSON

La directiva acepta variables en el formato del JSON del proyecto:

```json
{
  "variables": [
    {
      "simbolo": "V",
      "nombre": "Voltaje o Tensión",
      "unidad": "Voltios (V)",
      "descripcion": "Diferencia de potencial que empuja los electrones a través del circuito."
    }
  ]
}
```

**Uso en el componente:**

```html
<div [appKatex]="formula" 
     appFormulaTooltip 
     [variables]="tema().variables || []"></div>
```

### 3. Formato de la Interfaz VariableDefinition

```typescript
interface VariableDefinition {
  simbolo: string;      // Símbolo matemático (ej: "V", "I", "R")
  nombre: string;       // Nombre descriptivo (ej: "Voltaje o Tensión")
  unidad: string;       // Unidad de medida (ej: "Voltios (V)")
  descripcion: string;  // Descripción detallada
}
```

### 4. Combinando Símbolos y Variables

```html
<div [appKatex]="formula" 
     appFormulaTooltip 
     [symbols]="{ 'x': 'Variable auxiliar' }"
     [variables]="tema().variables || []"></div>
```

## Ejemplo Completo en Componente

```typescript
import { Component } from '@angular/core';
import { FormulaTooltipDirective } from '../../directives/formula-tooltip.directive';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [FormulaTooltipDirective],
  template: `
    <div class="equation-display"
         [appKatex]="ecuacion"
         appFormulaTooltip
         [variables]="variables">
    </div>
  `
})
export class MiComponente {
  ecuacion = 'V = I \\cdot R';
  
  variables = [
    {
      simbolo: 'V',
      nombre: 'Voltaje o Tensión',
      unidad: 'Voltios (V)',
      descripcion: 'Diferencia de potencial que empuja los electrones a través del circuito.'
    },
    {
      simbolo: 'I',
      nombre: 'Corriente o Intensidad',
      unidad: 'Amperios (A)',
      descripcion: 'Flujo de carga eléctrica por el conductor.'
    },
    {
      simbolo: 'R',
      nombre: 'Resistencia',
      unidad: 'Ohmios (Ω)',
      descripcion: 'Oposición del material al flujo de corriente.'
    }
  ];
}
```

## Comportamiento

1. **Detección automática**: La directiva busca automáticamente elementos renderizados por KaTeX (`.katex`)
2. **Mapeo de símbolos**: Identifica símbolos en `.mord`, `.mbin`, `.mrel`, `.mop` y subíndices en `.vlist-t`
3. **Tooltip interactivo**: Al pasar el cursor, muestra un tooltip con la información del símbolo
4. **Prioridad**: Las variables del JSON tienen prioridad sobre los símbolos comunes predefinidos

## Símbolos Comunes Predefinidos

La directiva incluye un diccionario de símbolos comunes de electrónica analógica:

- Voltajes: `V`, `V_{out}`, `V_{in}`, `V_+`, `V_-`, `V_{CE}`, `V_{CC}`, etc.
- Corrientes: `I`, `I_C`, `I_B`, `I_E`, `I_D`, `I_S`, etc.
- Resistencias: `R`, `R_C`, `R_E`, `R_f`, `R_{in}`, etc.
- Capacitancia e Inductancia: `C`, `L`, `C_1`, `C_2`, etc.
- Impedancias: `Z`, `Z_{in}`, `Z_{out}`, `X_C`, `X_L`
- Ganancias: `A`, `A_v`, `A_{OL}`, `β`
- Frecuencias: `f`, `f_c`, `f_0`, `ω`, `ω_0`
- Y muchos más...

## Estilos

Los tooltips usan los estilos definidos en `_formula-tooltips.scss`:

- Posicionamiento absoluto sobre el símbolo
- Fondo elevado con borde
- Transición suave al aparecer/desaparecer
- Cursor de ayuda en símbolos interactivos
- Resaltado al hacer hover

## Notas

- La directiva espera que KaTeX ya haya renderizado la fórmula antes de procesar los símbolos
- Usa un `setTimeout` de 100ms para asegurar que KaTeX haya completado el renderizado
- Los símbolos deben coincidir exactamente con los definidos en el JSON o en el diccionario común
