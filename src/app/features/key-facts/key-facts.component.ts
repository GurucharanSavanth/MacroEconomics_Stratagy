import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyFact } from '../../core/models/atlas.model';

@Component({
  selector: 'app-key-facts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kf-grid">
      @for (fact of facts(); track fact.id; let i = $index) {
        <article class="kf-card" [style.animation-delay]="i * 80 + 'ms'">
          <div class="kf-number" [style.color]="fact.color">{{ fact.number }}</div>
          <p class="kf-text">{{ fact.text }}</p>
          <cite class="kf-source">{{ fact.source }}</cite>
        </article>
      }
    </div>
  `,
  styles: `
    .kf-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.9rem;
    }

    .kf-card {
      padding: 1.1rem;
      border: 1px solid var(--border-bright, #2e2e50);
      border-radius: 0.45rem;
      background: rgba(20, 20, 37, 0.7);
      animation: kfSlideIn 0.5s ease both;
    }

    .kf-number {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .kf-text {
      margin: 0;
      color: var(--text-dim, #8a8580);
      line-height: 1.6;
      font-size: 0.88rem;
    }

    .kf-source {
      display: block;
      margin-top: 0.6rem;
      color: var(--text-muted, #4a4a5a);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.62rem;
      font-style: normal;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    @keyframes kfSlideIn {
      from {
        opacity: 0;
        transform: translateY(14px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
})
export class KeyFactsComponent {
  readonly facts = input<KeyFact[]>([]);
}
