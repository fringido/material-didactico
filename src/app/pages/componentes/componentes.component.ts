import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';

@Component({
  selector: 'app-componentes',
  standalone: true,
  imports: [CommonModule, RouterLink, KatexDirective],
  templateUrl: './componentes.component.html',
  styleUrls: ['./componentes.component.scss']
})
export class ComponentesComponent implements OnInit {
  private http = inject(HttpClient);

  categorias = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<any>('/assets/data/componentes.json').subscribe({
      next: (data) => {
        const cats = data.electronicComponents.categories;
        const others = data.electronicComponents.otros_componentes;
        
        if (others && others.length > 0) {
          cats.push({
            id: 'otros',
            nombre: 'Otros Componentes',
            descripcion: 'Componentes adicionales esenciales en sistemas analógicos.',
            componentes: others
          });
        }
        
        this.categorias.set(cats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
