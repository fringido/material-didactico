import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ComponentesComponent } from './pages/componentes/componentes.component';
import { DetalleComponent } from './pages/componentes/detalle/detalle.component';
import { SistemasComponent } from './pages/sistemas/sistemas.component';
import { SistemaDetalleComponent } from './pages/sistemas/detalle/detalle.component';
import { UnidadComponent } from './pages/unidad/unidad.component';
import { Clase1Component } from './pages/clase1/clase1.component';
import { Clase2Component } from './pages/clase2/clase2.component';
import { Clase3Component } from './pages/clase3/clase3.component';
import { Clase4Component } from './pages/clase4/clase4.component';
import { Clase5Component } from './pages/clase5/clase5.component';
import { Clase6Component } from './pages/clase6/clase6.component';
import { ClaseAcComponent } from './pages/clase-ac/clase-ac.component';
import { NodosMallasComponent } from './pages/componentes/nodos-mallas.component';
import { TemaDetalleComponent } from './pages/tema-detalle/tema-detalle.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'componentes', component: ComponentesComponent },
  { path: 'componentes/nodos-mallas', component: NodosMallasComponent },
  { path: 'componentes/:categoria/:id', component: DetalleComponent },
  { path: 'sistemas', component: SistemasComponent },
  { path: 'sistemas/:sistema/opamp/:tipo', component: SistemaDetalleComponent },
  { path: 'sistemas/:sistema/:tipo', component: SistemaDetalleComponent },

  // Rutas Modulares (Nuevas) - Mapeo a clases existentes
  { path: 'modulo/1/unidad/1', component: Clase1Component },
  { path: 'modulo/1/unidad/2', component: Clase3Component },
  { path: 'modulo/1/unidad/3', component: Clase4Component },
  { path: 'modulo/2/unidad/4', component: Clase5Component },
  { path: 'modulo/2/unidad/5', component: Clase6Component },
  { path: 'modulo/2/unidad/6', component: Clase2Component },
  
  { path: 'modulo/:modulo/unidad/:unidad/tema/:id', component: TemaDetalleComponent },
  { path: 'clase/ac/tema/:id', component: ClaseAcComponent },
  { path: 'clase/:clase/tema/:id', component: Clase4Component },
  { path: 'modulo/:modulo/unidad/:unidad', component: UnidadComponent },

  // Rutas antiguas /clase/* que muestran las páginas de clase completas
  { path: 'clase/ac', component: ClaseAcComponent, pathMatch: 'full' },
  { path: 'clase/1', component: Clase1Component, pathMatch: 'full' },
  { path: 'clase/2', component: Clase2Component, pathMatch: 'full' },
  { path: 'clase/3', component: Clase3Component, pathMatch: 'full' },
  { path: 'clase/4', component: Clase4Component, pathMatch: 'full' },
  { path: 'clase/5', component: Clase5Component, pathMatch: 'full' },
  { path: 'clase/6', component: Clase6Component, pathMatch: 'full' },

  { path: '**', component: NotFoundComponent }
];
