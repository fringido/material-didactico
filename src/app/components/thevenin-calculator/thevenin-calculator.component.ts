import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thevenin-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './thevenin-calculator.component.html',
  styleUrls: ['./thevenin-calculator.component.scss']
})
export class TheveninCalculatorComponent {
  private readonly fb = new FormBuilder();

  // Circuit parameters (voltage source + two resistors in a simple divider)
  form = this.fb.group({
    vs:  [12,  [Validators.required, Validators.min(0.1), Validators.max(100)]],
    r1:  [10,  [Validators.required, Validators.min(0.1), Validators.max(10000)]],
    r2:  [20,  [Validators.required, Validators.min(0.1), Validators.max(10000)]],
    rl:  [15,  [Validators.required, Validators.min(0.1), Validators.max(10000)]],
  });

  vs  = signal(12);
  r1  = signal(10);
  r2  = signal(20);
  rl  = signal(15);

  // Thevenin equivalents
  vth = computed(() => {
    const r2v = this.r2();
    const r1v = this.r1();
    const vsv = this.vs();
    return (r2v / (r1v + r2v)) * vsv;
  });

  rth = computed(() => {
    const r1v = this.r1();
    const r2v = this.r2();
    return (r1v * r2v) / (r1v + r2v);
  });

  // Norton equivalents
  iN = computed(() => this.vth() / this.rth());
  rN = computed(() => this.rth());

  // Load calculations
  iLoad = computed(() => this.vth() / (this.rth() + this.rl()));
  vLoad = computed(() => this.iLoad() * this.rl());
  pLoad = computed(() => this.iLoad() * this.vLoad());

  activeView = signal<'thevenin' | 'norton' | 'original'>('original');

  onApply() {
    if (this.form.valid) {
      const v = this.form.value;
      this.vs.set(v.vs!);
      this.r1.set(v.r1!);
      this.r2.set(v.r2!);
      this.rl.set(v.rl!);
    }
  }

  setView(view: 'thevenin' | 'norton' | 'original') {
    this.activeView.set(view);
  }

  fmt(n: number): string {
    return n.toFixed(3);
  }
}
