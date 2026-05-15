import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

declare var katex: any;

@Directive({
  selector: '[appKatex]',
  standalone: true
})
export class KatexDirective implements OnChanges {
  @Input('appKatex') equation: string = '';
  @Input() inline: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(): void {
    this.render();
  }

  private render(retries = 3): void {
    if (!this.equation) return;

    if (typeof katex !== 'undefined') {
      try {
        katex.render(this.equation, this.el.nativeElement, {
          throwOnError: false,
          displayMode: !this.inline
        });
      } catch (e) {
        this.el.nativeElement.textContent = this.equation;
      }
    } else if (retries > 0) {
      setTimeout(() => this.render(retries - 1), 200);
    } else {
      this.el.nativeElement.textContent = this.equation;
    }
  }
}
