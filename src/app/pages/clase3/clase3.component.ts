import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';

@Component({
  selector: 'app-clase3',
  standalone: true,
  imports: [CommonModule, RouterLink, PageBackBarComponent],
  templateUrl: './clase3.component.html',
  styleUrls: ['./clase3.component.scss']
})
export class Clase3Component implements OnInit {
  private http = inject(HttpClient);
  data = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.http.get<any>('/assets/data/clase-3/index.json').subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el índice de la Clase 3.');
        this.loading.set(false);
      }
    });
  }
}
