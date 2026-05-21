# InformacionClase - Material Didáctico Estructurado

## 📁 Estructura de Archivos

```
InformacionClase/
├── planDeEstudio.json                          # Plan completo del curso
├── ESTRUCTURA_JSON.md                          # Especificación de estructura
├── PLAN_ACCION.md                              # Plan de implementación
├── modulo-1/
│   ├── unidad-1-introduccion-electronica-analogica.json  ✅ COMPLETO
│   ├── unidad-2-analisis-circuitos-dc.json              ⏳ PENDIENTE
│   ├── unidad-3-analisis-circuitos-ac.json              ⏳ PENDIENTE
│   └── componentes-electronicos-detallado.json          ✅ REFERENCIA
└── modulo-2/
    ├── unidad-4-amplificadores-etapas-potencia.json     ⏳ PENDIENTE
    ├── unidad-5-osciladores-generadores.json            ⏳ PENDIENTE
    └── unidad-6-amplificadores-operacionales.json       ⏳ PENDIENTE
```

## 🎯 Convención de Nombres

### Archivos de Unidades:
**Formato:** `unidad-{numero}-{tema-en-kebab-case}.json`

**Ejemplos:**
- `unidad-1-introduccion-electronica-analogica.json`
- `unidad-2-analisis-circuitos-dc.json`
- `unidad-3-analisis-circuitos-ac.json`

### Archivos de Referencia:
**Formato:** `{descripcion-en-kebab-case}.json`

**Ejemplos:**
- `componentes-electronicos-detallado.json`
- `sistemas-analogicos.json`
- `ejercicios-resueltos.json`

## 📋 Mapeo Plan de Estudios → Archivos JSON

### Módulo 1: Fundamentos

| Unidad | Título | Archivo | Estado |
|--------|--------|---------|--------|
| 1 | Introducción a la Electrónica Analógica | `unidad-1-introduccion-electronica-analogica.json` | ✅ |
| 2 | Análisis de Circuitos en DC | `unidad-2-analisis-circuitos-dc.json` | ⏳ |
| 3 | Análisis de Circuitos en AC | `unidad-3-analisis-circuitos-ac.json` | ⏳ |

### Módulo 2: Aplicaciones

| Unidad | Título | Archivo | Estado |
|--------|--------|---------|--------|
| 4 | Amplificadores y Etapas de Potencia | `unidad-4-amplificadores-etapas-potencia.json` | ⏳ |
| 5 | Osciladores y Generadores de Señales | `unidad-5-osciladores-generadores.json` | ⏳ |
| 6 | Amplificadores Operacionales | `unidad-6-amplificadores-operacionales.json` | ⏳ |

## 🔄 Flujo de Integración

### 1. Carga de Datos
```
planDeEstudio.json → Estructura del curso
     ↓
modulo-X/unidad-Y-*.json → Contenido detallado
     ↓
Aplicación Angular → Renderizado dinámico
```

### 2. Navegación
```
Home (/) → Ver plan de estudios
     ↓
Módulo X → Ver unidades del módulo
     ↓
Unidad Y → Ver temas y ejercicios
     ↓
Tema Z → Contenido interactivo + simuladores
```

## 📊 Estructura Estándar de JSON

Cada archivo de unidad debe contener:

```json
{
  "metadata": {
    "modulo": number,
    "unidad": number,
    "titulo": "string",
    "semanas": "string",
    "version": "X.Y.Z",
    "fecha_actualizacion": "YYYY-MM-DD"
  },
  "objetivos": ["array de strings"],
  "temas": [
    {
      "id": "kebab-case",
      "nombre": "string",
      "descripcion": "string",
      "contenido": { /* estructura flexible */ }
    }
  ],
  "ejercicios": [
    {
      "numero": number,
      "descripcion": "string",
      "tipo": "teorico|practico|simulacion|laboratorio",
      "dificultad": "basico|intermedio|avanzado"
    }
  ],
  "evaluacion": { /* criterios y rúbrica */ },
  "recursos_adicionales": { /* simuladores, videos, lecturas */ },
  "referencias": [ /* bibliografía */ ]
}
```

## 🎓 Uso en la Aplicación

### Cargar Unidad:
```typescript
// En el componente
this.unidadService.cargarUnidad(1, 1).subscribe(data => {
  this.unidad = data;
  this.renderizarContenido();
});
```

### Renderizar Temas:
```html
<div *ngFor="let tema of unidad.temas">
  <h3>{{ tema.nombre }}</h3>
  <p>{{ tema.descripcion }}</p>
  <!-- Contenido dinámico según estructura -->
</div>
```

### Mostrar Ejercicios:
```html
<div *ngFor="let ejercicio of unidad.ejercicios">
  <span class="badge">{{ ejercicio.tipo }}</span>
  <span class="badge">{{ ejercicio.dificultad }}</span>
  <p>{{ ejercicio.descripcion }}</p>
</div>
```

## ✅ Checklist para Nuevo JSON

Antes de agregar un nuevo archivo JSON:

- [ ] Nombre sigue convención `unidad-{numero}-{tema}.json`
- [ ] Metadata completa (todos los campos)
- [ ] IDs únicos en temas y ejercicios
- [ ] Ecuaciones LaTeX válidas
- [ ] Referencias a componentes/simuladores existentes
- [ ] Ejercicios con todos los campos requeridos
- [ ] Recursos con rutas válidas
- [ ] Validado contra esquema JSON
- [ ] Probado en aplicación
- [ ] Documentado en este README

## 🔗 Referencias Cruzadas

### Componentes Detallados:
- Ver: `modulo-1/componentes-electronicos-detallado.json`
- Ruta app: `/componentes`

### Sistemas Analógicos:
- Ver: `public/assets/data/sistemas.json`
- Ruta app: `/sistemas`

### Simuladores:
- Amplificadores: `/sistemas` (AmplifierSimulatorComponent)
- Filtros: `/sistemas` (FilterSimulatorComponent)
- Osciladores: `/sistemas` (OscillatorSimulatorComponent)
- Transformador: `/componentes/otros/transformador`
- Potenciómetro: `/componentes/otros/potenciometro`
- Diodo (Shockley): `/componentes/activos/diodo`

## 📝 Notas Importantes

1. **Consistencia:** Todos los JSONs deben seguir la misma estructura base
2. **Versionado:** Incrementar versión al hacer cambios significativos
3. **Fechas:** Actualizar `fecha_actualizacion` en cada modificación
4. **IDs:** Usar kebab-case para todos los identificadores
5. **LaTeX:** Usar doble backslash para ecuaciones
6. **Rutas:** Verificar que todas las rutas de recursos existan

## 🚀 Próximos Pasos

1. Completar Unidad 2 (Análisis DC)
2. Completar Unidad 3 (Análisis AC)
3. Implementar servicio de carga dinámica
4. Crear componentes de renderizado
5. Agregar navegación por unidades
6. Completar unidades del Módulo 2

## 📞 Mantenimiento

Para actualizar contenido:
1. Editar el JSON correspondiente
2. Incrementar versión si es cambio mayor
3. Actualizar fecha
4. Validar estructura
5. Probar en aplicación
6. Actualizar este README si es necesario

---

**Última actualización:** 2026-05-15
**Versión del sistema:** 1.0.0
**Responsable:** Camacho Ríos Maximiliano Alfredo
