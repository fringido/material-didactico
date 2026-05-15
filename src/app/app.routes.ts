import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ComponentesComponent } from './pages/componentes/componentes.component';
import { DetalleComponent } from './pages/componentes/detalle/detalle.component';
import { SistemasComponent } from './pages/sistemas/sistemas.component';
import { SistemaDetalleComponent } from './pages/sistemas/detalle/detalle.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'componentes', component: ComponentesComponent },
  { path: 'componentes/:categoria/:id', component: DetalleComponent },
  { path: 'sistemas', component: SistemasComponent },
  { path: 'sistemas/:sistema/:tipo', component: SistemaDetalleComponent },
  { path: '**', component: NotFoundComponent }
];
