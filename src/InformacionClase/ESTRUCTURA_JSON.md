# Especificación de Estructura JSON para Material Didáctico

## Estructura de Carpetas

```
src/InformacionClase/
├── modulo-1/
│   ├── unidad-1-introduccion-electronica-analogica.json
│   ├── unidad-2-analisis-circuitos-dc.json
│   └── unidad-3-analisis-circuitos-ac.json
├── modulo-2/
│   ├── unidad-4-amplificadores-etapas-potencia.json
│   ├── unidad-5-osciladores-generadores.json
│   └── unidad-6-amplificadores-operacionales.json
└── planDeEstudio.json
```

## Estructura Estándar de JSON por Unidad

```json
{
  "metadata": {
    "modulo": 1,
    "unidad": 1,
    "titulo": "Introducción a la Electrónica Analógica",
    "semanas": "1-2",
    "version": "1.0.0",
    "fecha_actualizacion": "2026-05-15"
  },
  "objetivos": [
    "Objetivo 1",
    "Objetivo 2"
  ],
  "temas": [
    {
      "id": "tema-1",
      "nombre": "Nombre del Tema",
      "descripcion": "Descripción breve",
      "contenido": {
        "conceptos_clave": [],
        "ecuaciones": [],
        "ejemplos": [],
        "aplicaciones": []
      },
      "recursos": {
        "simuladores": [],
        "videos": [],
        "lecturas": []
      }
    }
  ],
  "componentes": [
    {
      "id": "componente-id",
      "nombre": "Nombre del Componente",
      "tipo": "activo|pasivo|otro",
      "descripcion": "Descripción detallada",
      "ecuacion_principal": "LaTeX equation",
      "variables": {},
      "caracteristicas": [],
      "aplicaciones": [],
      "simulador": true|false
    }
  ],
  "ejercicios": [
    {
      "numero": 1,
      "descripcion": "Descripción del ejercicio",
      "tipo": "teorico|practico|simulacion",
      "dificultad": "basico|intermedio|avanzado",
      "recursos_necesarios": []
    }
  ],
  "evaluacion": {
    "criterios": [],
    "rubrica": {}
  },
  "referencias": []
}
```

## Mapeo de Unidades a Archivos JSON

### Módulo 1

#### Unidad 1: Introducción a la Electrónica Analógica
**Archivo:** `modulo-1/unidad-1-introduccion-electronica-analogica.json`
**Temas:**
- Conceptos básicos de electrónica analógica
- Características y propiedades de los componentes electrónicos
- Circuitos básicos: amplificadores, filtros, osciladores

**Componentes a incluir:**
- Clasificación activos vs pasivos
- Diodos (todos los tipos)
- Transistores (BJT, FET)
- Op-Amps
- Resistencias, Capacitores, Inductores
- Transformadores, Potenciómetros

#### Unidad 2: Análisis de Circuitos en DC
**Archivo:** `modulo-1/unidad-2-analisis-circuitos-dc.json`
**Temas:**
- Leyes y teoremas fundamentales (Ohm, Kirchhoff)
- Métodos de análisis: nodos y mallas
- Cálculo de corrientes, voltajes y resistencias equivalentes
- Teoremas de Thevenin y Norton

**Componentes a incluir:**
- Resistencias (Ley de Ohm)
- Fuentes de voltaje y corriente
- Análisis de circuitos serie y paralelo

#### Unidad 3: Análisis de Circuitos en AC
**Archivo:** `modulo-1/unidad-3-analisis-circuitos-ac.json`
**Temas:**
- Conceptos de señales y sistemas en AC
- Filtros pasivos (RC, RL, RLC)
- Respuesta en frecuencia
- Análisis de respuesta transitoria y estable

**Componentes a incluir:**
- Capacitores (reactancia capacitiva)
- Inductores (reactancia inductiva)
- Filtros pasivos (4 tipos)
- Diagramas de Bode

### Módulo 2

#### Unidad 4: Amplificadores y Etapas de Potencia
**Archivo:** `modulo-2/unidad-4-amplificadores-etapas-potencia.json`
**Temas:**
- Clasificación de amplificadores: clase A, B, AB y C
- Configuraciones: emisor común, base común, colector común
- Diseño de amplificadores de bajo y alto nivel
- Etapas de potencia y aplicaciones

**Componentes a incluir:**
- Amplificadores (3 configuraciones BJT)
- Clases de amplificadores
- Análisis de ganancia y eficiencia

#### Unidad 5: Osciladores y Generadores de Señales
**Archivo:** `modulo-2/unidad-5-osciladores-generadores.json`
**Temas:**
- Osciladores LC y RC
- Osciladores de cristal y PLL
- Generadores de señales senoidales y no senoidales
- Estabilidad y ajuste de frecuencia

**Componentes a incluir:**
- Osciladores (5 tipos)
- Criterio de Barkhausen
- Formas de onda

#### Unidad 6: Amplificadores Operacionales
**Archivo:** `modulo-2/unidad-6-amplificadores-operacionales.json`
**Temas:**
- Características del amplificador operacional ideal
- Configuraciones básicas: inversor, no inversor, sumador
- Integrador y derivador
- Filtros activos con op-amps
- Aplicaciones en instrumentación

**Componentes a incluir:**
- Op-Amps (configuraciones)
- Filtros activos
- Integradores y derivadores

## Campos Obligatorios por Tipo

### Para Componentes Electrónicos:
```json
{
  "id": "string (único)",
  "nombre": "string",
  "tipo": "activo|pasivo|otro",
  "descripcion": "string",
  "ecuacion_principal": "LaTeX string",
  "variables": {
    "simbolo": "descripción"
  },
  "terminales": ["array"],
  "aplicaciones": ["array"],
  "simulador": true,
  "simulacion_dinamica": {
    "tipo": "string (opcional, ej. rc_serie, divisor)",
    "titulo": "string (opcional)",
    "descripcion": "string (opcional)",
    "ancho": 200,
    "alto": 200,
    "diagrama": [
      {
        "tipo": "linea|fuente_ac|resistencia|capacitor|diodo|nodo|tierra|transistor_bjt",
        "x": 30, "y": 100,
        "x1": 30, "y1": 30, "x2": 70, "y2": 30,
        "id": "R1",
        "rotacion": 0,
        "valor": "string (opcional, ej. {{ R1 }}Ω)"
      }
    ],
    "controles": [
      {
        "id": "vin",
        "label": "Voltaje Pico",
        "min": 1,
        "max": 15,
        "step": 0.5,
        "default": 5,
        "unidad": "V"
      }
    ],
    "metricas": [
      {
        "label": "Vout",
        "formula_katex": "V_{out} = V_{in} - V_d",
        "calculo": "vin - 0.7",
        "unidad": "V"
      }
    ],
    "graficas": [
      {
        "id": "vout",
        "label": "Señal de Salida",
        "color": "#10b981",
        "calculo_y": "Math.max(0, vin * Math.sin(x) - vd)"
      }
    ]
  }
}
```

### Para Temas:
```json
{
  "id": "string (único)",
  "nombre": "string",
  "descripcion": "string",
  "conceptos_clave": [
    {
      "nombre": "string",
      "descripcion": "string",
      "formula": "LaTeX string (opcional)"
    }
  ],
  "ecuaciones": [
    {
      "nombre": "string",
      "formula": "LaTeX string",
      "variables": {}
    }
  ]
}
```

### Para Ejercicios:
```json
{
  "numero": number,
  "descripcion": "string",
  "tipo": "teorico|practico|simulacion|laboratorio",
  "dificultad": "basico|intermedio|avanzado",
  "tiempo_estimado": "string",
  "recursos_necesarios": ["array"],
  "pasos": ["array (opcional)"],
  "solucion": "string (opcional)"
}
```

## Convenciones de Nomenclatura

1. **IDs:** kebab-case (ej: `diodo-rectificador`, `amplificador-emisor-comun`)
2. **Archivos:** kebab-case con prefijo de módulo y unidad
3. **Ecuaciones:** LaTeX estándar con doble backslash
4. **Fechas:** ISO 8601 (YYYY-MM-DD)
5. **Versiones:** Semantic Versioning (X.Y.Z)

## Integración con la Aplicación

### Carga Automática:
La aplicación debe:
1. Leer `planDeEstudio.json` para obtener estructura de módulos/unidades
2. Cargar dinámicamente el JSON correspondiente a cada unidad
3. Renderizar componentes, simuladores y ejercicios según disponibilidad
4. Generar rutas automáticamente basadas en IDs

### Rutas Generadas:
- `/modulo/:numero/unidad/:numero` - Vista general de unidad
- `/modulo/:numero/unidad/:numero/tema/:id` - Detalle de tema
- `/componentes/:tipo/:id` - Detalle de componente
- `/ejercicios/:numero` - Vista de ejercicio

## Validación

Cada JSON debe validarse contra:
1. Estructura de metadata completa
2. IDs únicos dentro del archivo
3. Referencias válidas a otros componentes
4. Ecuaciones LaTeX válidas
5. Tipos de datos correctos

## Información Faltante a Completar

### Unidad 2 (Análisis DC):
- [ ] Teorema de Thevenin (ejemplos y ejercicios)
- [ ] Teorema de Norton (ejemplos y ejercicios)
- [ ] Análisis de nodos (paso a paso)
- [ ] Análisis de mallas (paso a paso)
- [ ] Circuitos equivalentes

### Unidad 3 (Análisis AC):
- [ ] Diagramas de Bode (generador interactivo)
- [ ] Respuesta transitoria (simulador)
- [ ] Respuesta en estado estable
- [ ] Análisis fasorial

### Unidad 4 (Amplificadores):
- [ ] Punto de operación Q
- [ ] Recta de carga
- [ ] Distorsión armónica
- [ ] Eficiencia por clase

### Unidad 5 (Osciladores):
- [ ] Cálculo de componentes (herramienta)
- [ ] Análisis de estabilidad
- [ ] PLL (Phase-Locked Loop) detallado

### Unidad 6 (Op-Amps):
- [ ] Slew rate y limitaciones reales
- [ ] CMRR (Common Mode Rejection Ratio)
- [ ] Offset de voltaje
- [ ] Filtros Butterworth, Chebyshev, Bessel

## Próximos Pasos

1. Crear estructura de carpetas modulo-1 y modulo-2
2. Migrar contenido existente a nuevos archivos
3. Completar información faltante
4. Crear simuladores adicionales necesarios
5. Actualizar componentes de Angular para carga dinámica
6. Implementar sistema de navegación por unidades
