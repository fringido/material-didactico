import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

type InputMode = 'thevenin' | 'norton';

@Component({
  selector: 'app-norton-transformer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './norton-transformer.component.html',
  styleUrls: ['./norton-transformer.component.scss']
})
export class NortonTransformerComponent {
  private readonly fb = new FormBuilder();

  inputMode = signal<InputMode>('thevenin');

  theveninForm = this.fb.group({
    vth: [12,  [Validators.required, Validators.min(0.01), Validators.max(1000)]],
    rth: [10,  [Validators.required, Validators.min(0.01), Validators.max(100000)]],
  });

  nortonForm = this.fb.group({
    iN:  [1.2, [Validators.required, Validators.min(0.001), Validators.max(1000)]],
    rN:  [10,  [Validators.required, Validators.min(0.01), Validators.max(100000)]],
  });

  // Thevenin values
  vth = signal(12);
  rth = signal(10);

  // Norton values (derived from Thevenin or entered directly)
  iN  = signal(1.2);
  rN  = signal(10);

  // Computed outputs (always both shown)
  theveninFromNorton = computed(() => ({
    vth: this.iN() * this.rN(),
    rth: this.rN(),
  }));

  nortonFromThevenin = computed(() => ({
    iN:  this.vth() / this.rth(),
    rN:  this.rth(),
  }));

  // Animated "equality" check
  areEqual = computed(() => {
    const mode = this.inputMode();
    if (mode === 'thevenin') {
      const n = this.nortonFromThevenin();
      return Math.abs(n.iN - this.iN()) < 0.001 && Math.abs(n.rN - this.rN()) < 0.001;
    }
    const t = this.theveninFromNorton();
    return Math.abs(t.vth - this.vth()) < 0.001 && Math.abs(t.rth - this.rth()) < 0.001;
  });

  setMode(mode: InputMode) {
    this.inputMode.set(mode);
  }

  applyThevenin() {
    if (this.theveninForm.valid) {
      const v = this.theveninForm.value;
      this.vth.set(v.vth!);
      this.rth.set(v.rth!);
      // Sync output form
      const n = this.nortonFromThevenin();
      this.nortonForm.setValue({ iN: +n.iN.toFixed(4), rN: +n.rN.toFixed(4) });
      this.iN.set(n.iN);
      this.rN.set(n.rN);
    }
  }

  applyNorton() {
    if (this.nortonForm.valid) {
      const v = this.nortonForm.value;
      this.iN.set(v.iN!);
      this.rN.set(v.rN!);
      // Sync output form
      const t = this.theveninFromNorton();
      this.theveninForm.setValue({ vth: +t.vth.toFixed(4), rth: +t.rth.toFixed(4) });
      this.vth.set(t.vth);
      this.rth.set(t.rth);
    }
  }

  fmt(n: number): string {
    return n.toFixed(4);
  }
}
