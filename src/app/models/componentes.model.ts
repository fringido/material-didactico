export interface ColorBand {
  color: string;
  cifra_1: number | null;
  cifra_2: number | null;
  multiplicador: number | null;
  tolerancia: string | null;
  coef_temperatura: string | null;
}

export interface ElementoCircuito {
  tipo: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  id?: string;
  rotacion?: number;
  valor?: string;
}

export interface ControlCircuito {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unidad?: string;
}

export interface MetricaCircuito {
  label: string;
  formula_katex: string;
  calculo: string; // expression string using control IDs
  unidad?: string;
}

export interface GraficaCircuito {
  id: string;
  label: string;
  color: string;
  calculo_y: string; // formula for y given x, t, and controls
}

export interface MatricaDinamica {
  tipo: string;
  filas: string[][];
  variables: string[];
}

export interface SimulacionDinamica {
  tipo?: string;
  titulo?: string;
  descripcion?: string;
  diagrama: ElementoCircuito[];
  controles: ControlCircuito[];
  metricas: MetricaCircuito[];
  graficas?: GraficaCircuito[];
  matriz_dinamica?: MatricaDinamica;
  ancho?: number;
  alto?: number;
}


export interface Subtipo {
  id?: string;
  nombre: string;
  descripcion: string;
  material?: string;
  color?: string;
  funcion?: string;
  operacion?: string;
  caracteristicas?: any;
  aplicaciones?: string[];
  ventajas?: string[];
  desventajas?: string[];
  criterios_seleccion?: string[];
  nombre_completo?: string;
  parametros_operacion?: any;
  tipos_por_material?: any[];
  simulacion_dinamica?: SimulacionDinamica;
}

export interface Componente {
  id: string;
  nombre: string;
  descripcion: string;
  subtitulo?: string;
  clasificacion?: string;
  terminales?: string[];
  principio_operacion?: {
    polarizacion_directa?: string;
    polarizacion_inversa?: string;
    composicion?: string;
  };
  funcion?: string;
  subtipos?: Subtipo[];
  familias?: any[];
  caracteristicas_ideales?: string[];
  aplicaciones?: string[];
  formula_ganancia_inversor?: any;
  categoria?: string;
  unidad?: string;
  ley_fundamental?: string;
  comportamiento?: any;
  funciones?: string[];
  codigo_colores?: {
    descripcion: string;
    numero_bandas: number;
    interpretacion_4_bandas: any;
    tabla: ColorBand[];
    ejemplo: any;
  };
  ecuacion_caracteristica?: string;
  reactancia_capacitiva?: any;
  tipos?: any[];
  caracteristicas_electricas?: any[];
  lectura_valor?: any;
  reactancia_inductiva?: any;
  partes?: any[];
  tipos_por_nucleo?: any[];
  ecuacion_fundamental?: string;
  variables?: any;
  simulacion_dinamica?: SimulacionDinamica;
  conceptos_clave_arr?: any[];
  formulas?: any[];
  variables_tooltips?: any;
  [key: string]: any;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  concepto_clave?: string;
  componentes: Componente[];
}

export interface FilaTabla {
  componente?: string;
  simbolo?: string;
  impedancia?: string;
  respuesta_alta_frecuencia?: string;
  caracteristica?: string;
  activos?: string;
  pasivos?: string;
}

export interface ElectronicData {
  electronicComponents: {
    metadata: { title: string; description: string; version: string };
    comparison: { title: string; headers: string[]; rows: FilaTabla[] };
    categories: Categoria[];
    otros_componentes: Componente[];
    tabla_comparativa_frecuencia: { titulo: string; headers: string[]; filas: FilaTabla[] };
    aplicaciones_sistemas_analogicos: {
      titulo: string;
      items: { nombre: string; descripcion: string; tipos?: string[] }[];
      nota: string;
    };
  };
}
