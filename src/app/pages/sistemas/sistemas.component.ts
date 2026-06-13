import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { KatexDirective } from '../../directives/katex.directive';
import { AmplifierLabComponent } from '../../components/amplifier-lab/amplifier-lab.component';
import { FilterSimulatorComponent } from '../../components/circuit-simulator/filter-simulator.component';
import { OscillatorSimulatorComponent } from '../../components/circuit-simulator/oscillator-simulator.component';
import { BodeChartComponent } from '../../components/bode-chart/bode-chart.component';
import { PageBackBarComponent } from '../../components/page-back-bar/page-back-bar.component';

@Component({
  selector: 'app-sistemas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KatexDirective,
    AmplifierLabComponent,
    FilterSimulatorComponent,
    OscillatorSimulatorComponent,
    BodeChartComponent,
    PageBackBarComponent
  ],
  templateUrl: './sistemas.component.html',
  styles: []
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
