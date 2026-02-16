import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpillbackStep } from '../../core/models/atlas.model';

@Component({
  selector: 'app-spillback-loop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sl-track">
      @for (step of steps(); track step.step; let last = $last) {
        <div class="sl-node">
          <div class="sl-dot" [style.background]="step.color">{{ step.step }}</div>
          <div class="sl-body">
            <h4 class="sl-label" [style.color]="step.color">{{ step.label }}</h4>
            <p class="sl-desc">{{ step.description }}</p>
          </div>
        </div>
        @if (!last) {
          <div class="sl-arrow">
            <svg viewBox="0 0 24 40" width="24" height="40">
              <path d="M12 0 L12 30 M6 24 L12 30 L18 24" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .sl-track {
      display: grid;
      gap: 0;
      justify-items: center;
      max-width: 36rem;
      margin: 0 auto;
    }

    .sl-node {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      width: 100%;
      padding: 0.6rem 0;
    }

    .sl-dot {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: #070711;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 700;
      font-size: 0.78rem;
    }

    .sl-body {
      flex: 1;
    }

    .sl-label {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
    }

    .sl-desc {
      margin: 0.2rem 0 0;
      color: var(--text-dim, #8a8580);
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .sl-arrow {
      color: var(--text-muted, #4a4a5a);
      line-height: 0;
    }
  `
})
export class SpillbackLoopComponent {
  readonly steps = input<SpillbackStep[]>([]);
}
