import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { AmplifierSimulatorComponent } from '../../components/circuit-simulator/amplifier-simulator.component';
import { FilterSimulatorComponent } from '../../components/circuit-simulator/filter-simulator.component';
import { OscillatorSimulatorComponent } from '../../components/circuit-simulator/oscillator-simulator.component';

@Component({
  selector: 'app-sistemas',
  standalone: true,
  imports: [CommonModule, RouterLink, KatexDirective, AmplifierSimulatorComponent, FilterSimulatorComponent, OscillatorSimulatorComponent],
  templateUrl: './sistemas.component.html',
  styleUrls: ['./sistemas.component.scss']
})
export class SistemasComponent implements OnInit {
  private http = inject(HttpClient);

  sistemas = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    this.http.get<any>('/assets/data/sistemas.json').subscribe({
      next: (data: any) => {
        this.sistemas.set(data.sistemas_analogos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
