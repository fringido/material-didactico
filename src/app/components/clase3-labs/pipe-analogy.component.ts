import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pipe-analogy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pipe-analogy.component.html',
  styleUrls: ['./clase3-lab.scss']
})
export class PipeAnalogyComponent {
  pressure = signal(12);
  restriction = signal(50);

  flow = computed(() => {
    const r = Math.max(this.restriction(), 1);
    return this.pressure() / r * 10;
  });

  flowPercent = computed(() => Math.min(100, this.flow()));
}
