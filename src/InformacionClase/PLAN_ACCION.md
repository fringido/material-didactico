# Plan de Acción: Estandarización de JSONs

## ✅ COMPLETADO

### 1. Estructura Estandarizada
- ✅ Documento de especificación creado (`ESTRUCTURA_JSON.md`)
- ✅ Estructura de carpetas: `modulo-1/` y `modulo-2/`
- ✅ Primer JSON estandarizado: `unidad-1-introduccion-electronica-analogica.json`

### 2. Archivos Existentes
- ✅ `planDeEstudio.json` - Estructura completa del curso
- ✅ `componentes.json` (en Clase 2) - Información detallada de componentes
- ✅ `sistemas.json` (en public/assets/data) - Amplificadores, filtros, osciladores

## 📋 PENDIENTE POR CREAR

### Módulo 1

#### ✅ Unidad 1: Introducción a la Electrónica Analógica
**Estado:** COMPLETADO
**Archivo:** `modulo-1/unidad-1-introduccion-electronica-analogica.json`

#### ⏳ Unidad 2: Análisis de Circuitos en DC
**Estado:** PENDIENTE
**Archivo:** `modulo-1/unidad-2-analisis-circuitos-dc.json`
**Contenido necesario:**
- [ ] Ley de Ohm (ejemplos paso a paso)
- [ ] Leyes de Kirchhoff (KVL y KCL)
- [ ] Análisis de nodos (método y ejemplos)
- [ ] Análisis de mallas (método y ejemplos)
- [ ] Teorema de Thevenin (procedimiento y ejemplos)
- [ ] Teorema de Norton (procedimiento y ejemplos)
- [ ] Resistencias en serie y paralelo
- [ ] Divisores de voltaje y corriente
- [ ] Ejercicios 4-7 del plan de estudios

#### ⏳ Unidad 3: Análisis de Circuitos en AC
**Estado:** PENDIENTE
**Archivo:** `modulo-1/unidad-3-analisis-circuitos-ac.json`
**Contenido necesario:**
- [ ] Señales senoidales (parámetros)
- [ ] Fasores y números complejos
- [ ] Impedancia compleja (R, L, C)
- [ ] Análisis fasorial
- [ ] Filtros RC, RL, RLC (diseño y análisis)
- [ ] Frecuencia de corte y resonancia
- [ ] Respuesta en frecuencia
- [ ] Diagramas de Bode (generador interactivo)
- [ ] Respuesta transitoria vs estable
- [ ] Ejercicios 8-11 del plan de estudios

### Módulo 2

#### ⏳ Unidad 4: Amplificadores y Etapas de Potencia
**Estado:** PENDIENTE
**Archivo:** `modulo-2/unidad-4-amplificadores-etapas-potencia.json`
**Contenido necesario:**
- [ ] Clases de amplificadores (A, B, AB, C)
- [ ] Eficiencia por clase
- [ ] Configuraciones BJT detalladas:
  - [ ] Emisor Común (análisis completo)
  - [ ] Base Común (análisis completo)
  - [ ] Colector Común (análisis completo)
- [ ] Punto de operación Q
- [ ] Recta de carga (DC y AC)
- [ ] Polarización de transistores
- [ ] Amplificadores de bajo nivel
- [ ] Amplificadores de potencia
- [ ] Distorsión armónica
- [ ] Acoplamiento entre etapas
- [ ] Ejercicios 12-15 del plan de estudios

#### ⏳ Unidad 5: Osciladores y Generadores de Señales
**Estado:** PENDIENTE
**Archivo:** `modulo-2/unidad-5-osciladores-generadores.json`
**Contenido necesario:**
- [ ] Osciladores LC (Colpitts, Hartley)
- [ ] Osciladores RC (corrimiento de fase, Wien)
- [ ] Osciladores de cristal (funcionamiento detallado)
- [ ] PLL (Phase-Locked Loop)
- [ ] VCO (Voltage Controlled Oscillator)
- [ ] Generadores de onda cuadrada (555 Timer)
- [ ] Generadores de onda triangular
- [ ] Generadores de onda diente de sierra
- [ ] Estabilidad de frecuencia
- [ ] Cálculo de componentes (herramienta)
- [ ] Ejercicios 16-18 del plan de estudios

#### ⏳ Unidad 6: Amplificadores Operacionales
**Estado:** PENDIENTE
**Archivo:** `modulo-2/unidad-6-amplificadores-operacionales.json`
**Contenido necesario:**
- [ ] Características ideales vs reales
- [ ] Parámetros importantes:
  - [ ] Ganancia de lazo abierto (AOL)
  - [ ] Impedancia de entrada
  - [ ] Impedancia de salida
  - [ ] Slew Rate
  - [ ] CMRR (Common Mode Rejection Ratio)
  - [ ] Offset de voltaje
  - [ ] Ancho de banda
- [ ] Configuraciones básicas:
  - [ ] Inversor (análisis y diseño)
  - [ ] No Inversor (análisis y diseño)
  - [ ] Sumador (análisis y diseño)
  - [ ] Restador (análisis y diseño)
  - [ ] Seguidor de voltaje (buffer)
- [ ] Integrador (análisis y aplicaciones)
- [ ] Derivador (análisis y aplicaciones)
- [ ] Comparadores
- [ ] Filtros activos:
  - [ ] Butterworth
  - [ ] Chebyshev
  - [ ] Bessel
  - [ ] Sallen-Key
- [ ] Aplicaciones en instrumentación
- [ ] Ejercicios 19-23 del plan de estudios

## 🔧 INFORMACIÓN FALTANTE EN ARCHIVOS EXISTENTES

### componentes.json
**Completar:**
- [ ] Ejemplos prácticos de cálculo para cada componente
- [ ] Datasheets de referencia
- [ ] Procedimientos de medición
- [ ] Códigos de identificación (más allá de colores)
- [ ] Tolerancias y especificaciones térmicas
- [ ] Casos de falla comunes

### sistemas.json
**Completar:**
- [ ] Ejemplos numéricos resueltos
- [ ] Procedimientos de diseño paso a paso
- [ ] Criterios de selección de componentes
- [ ] Análisis de estabilidad
- [ ] Compensación de frecuencia
- [ ] Técnicas de medición

## 🎯 SIMULADORES ADICIONALES NECESARIOS

### Unidad 2 (DC):
- [ ] Simulador de análisis de nodos
- [ ] Simulador de análisis de mallas
- [ ] Calculadora de Thevenin/Norton
- [ ] Visualizador de divisores de voltaje

### Unidad 3 (AC):
- [ ] Generador de diagramas de Bode
- [ ] Simulador de respuesta transitoria
- [ ] Calculadora de impedancia compleja
- [ ] Visualizador de fasores

### Unidad 4 (Amplificadores):
- [ ] Simulador de punto Q
- [ ] Graficador de recta de carga
- [ ] Calculadora de polarización
- [ ] Analizador de distorsión

### Unidad 5 (Osciladores):
- [ ] Calculadora de componentes para osciladores
- [ ] Simulador de PLL
- [ ] Generador de formas de onda personalizado

### Unidad 6 (Op-Amps):
- [ ] Diseñador de filtros activos
- [ ] Calculadora de configuraciones Op-Amp
- [ ] Simulador de integrador/derivador
- [ ] Analizador de CMRR y offset

## 📱 INTEGRACIÓN CON APLICACIÓN

### Cambios Necesarios en Angular:

#### 1. Servicio de Carga Dinámica
```typescript
// src/app/services/unidad.service.ts
@Injectable()
export class UnidadService {
  cargarUnidad(modulo: number, unidad: number): Observable<any> {
    return this.http.get(`/assets/data/modulo-${modulo}/unidad-${unidad}-*.json`);
  }
}
```

#### 2. Componente de Unidad
```typescript
// src/app/pages/unidad/unidad.component.ts
// Renderizar contenido dinámico basado en JSON
```

#### 3. Rutas Dinámicas
```typescript
// src/app/app.routes.ts
{ path: 'modulo/:modulo/unidad/:unidad', component: UnidadComponent }
{ path: 'modulo/:modulo/unidad/:unidad/tema/:tema', component: TemaComponent }
```

#### 4. Navegación en Home
- Agregar enlaces a cada unidad desde el plan de estudios
- Indicadores de progreso por unidad
- Badges de contenido disponible (simuladores, ejercicios, etc.)

## 📊 PRIORIDADES

### Alta Prioridad (Semana 1-2):
1. ✅ Crear estructura estandarizada
2. ⏳ Completar Unidad 2 (Análisis DC) - FUNDAMENTAL
3. ⏳ Completar Unidad 3 (Análisis AC) - FUNDAMENTAL
4. ⏳ Crear simuladores básicos para Unidad 2 y 3

### Media Prioridad (Semana 3-4):
5. ⏳ Completar Unidad 4 (Amplificadores)
6. ⏳ Completar Unidad 6 (Op-Amps)
7. ⏳ Implementar carga dinámica en Angular

### Baja Prioridad (Semana 5-6):
8. ⏳ Completar Unidad 5 (Osciladores)
9. ⏳ Agregar ejemplos adicionales
10. ⏳ Crear simuladores avanzados

## 🎓 CONTENIDO EDUCATIVO ADICIONAL

### Para Cada Unidad:
- [ ] Videos explicativos (enlaces o embebidos)
- [ ] Presentaciones descargables
- [ ] Hojas de fórmulas
- [ ] Guías de laboratorio
- [ ] Rúbricas de evaluación detalladas
- [ ] Banco de preguntas de examen
- [ ] Proyectos integradores

### Recursos Generales:
- [ ] Glosario de términos
- [ ] Tabla de símbolos completa
- [ ] Conversión de unidades
- [ ] Prefijos métricos
- [ ] Código de colores (resistencias, capacitores)
- [ ] Datasheets de componentes comunes

## 📝 PRÓXIMOS PASOS INMEDIATOS

1. **Crear Unidad 2 JSON** (Análisis DC)
   - Copiar estructura de Unidad 1
   - Agregar contenido de leyes y teoremas
   - Incluir ejercicios 4-7

2. **Crear Unidad 3 JSON** (Análisis AC)
   - Copiar estructura de Unidad 1
   - Agregar contenido de AC y filtros
   - Incluir ejercicios 8-11

3. **Actualizar Home Component**
   - Agregar enlaces a unidades
   - Mostrar progreso de contenido
   - Indicar simuladores disponibles

4. **Crear Servicio de Unidades**
   - Implementar carga dinámica
   - Caché de datos
   - Manejo de errores

5. **Documentar Proceso**
   - Guía para agregar nuevas unidades
   - Plantilla de JSON
   - Checklist de validación

## ✅ VALIDACIÓN

Cada JSON debe pasar:
- [ ] Validación de estructura (metadata completa)
- [ ] IDs únicos
- [ ] Ecuaciones LaTeX válidas
- [ ] Referencias a componentes existentes
- [ ] Ejercicios con todos los campos
- [ ] Recursos con rutas válidas

## 📞 CONTACTO Y SOPORTE

Para agregar nuevo contenido:
1. Copiar plantilla de JSON
2. Completar metadata
3. Agregar temas y contenido
4. Incluir ejercicios
5. Validar estructura
6. Probar en aplicación
7. Documentar cambios
