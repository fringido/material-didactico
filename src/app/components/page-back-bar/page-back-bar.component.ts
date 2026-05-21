import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-back-bar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-toolbar">
      <a [routerLink]="backLink()" class="page-back">
        <span class="page-back__icon" aria-hidden="true">←</span>
        <span class="page-back__label">{{ backLabel() }}</span>
      </a>
      @if (breadcrumb()) {
        <nav class="breadcrumb breadcrumb--compact" aria-label="Miga de pan">
          @for (item of breadcrumb(); track item.label; let last = $last) {
            @if (!last && item.link) {
              <a [routerLink]="item.link" class="breadcrumb__link">{{ item.label }}</a>
              <span class="breadcrumb__sep">›</span>
            } @else {
              <span class="breadcrumb__current">{{ item.label }}</span>
            }
          }
        </nav>
      }
    </div>
  `
})
export class PageBackBarComponent {
  backLink = input<string>('/');
  backLabel = input<string>('Volver');
  breadcrumb = input<{ label: string; link?: string }[] | null>(null);
}
