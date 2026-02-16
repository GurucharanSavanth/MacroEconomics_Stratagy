import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpilloverTier } from '../../core/models/atlas.model';

@Component({
  selector: 'app-spillover-tiers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="st-grid">
      @for (tier of tiers(); track tier.tier) {
        <article class="st-card" [style.border-color]="tier.color">
          <div class="st-header">
            <span class="st-tier-badge" [style.background]="tier.color">Tier {{ tier.tier }}</span>
            <h4 class="st-title">{{ tier.label }}</h4>
          </div>
          <p class="st-desc">{{ tier.description }}</p>
          <div class="st-countries">
            @for (country of tier.countries; track country) {
              <span class="st-country-chip" [style.border-color]="tier.color">{{ country }}</span>
            }
          </div>
          <div class="st-flow" [style.color]="tier.color">{{ tier.capitalFlow }}</div>
        </article>
      }
    </div>
  `,
  styles: `
    .st-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.9rem;
    }

    .st-card {
      padding: 1rem;
      border: 1px solid;
      border-radius: 0.45rem;
      background: rgba(20, 20, 37, 0.75);
    }

    .st-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }

    .st-tier-badge {
      flex-shrink: 0;
      padding: 0.15rem 0.5rem;
      border-radius: 0.25rem;
      color: #070711;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .st-title {
      margin: 0;
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      color: var(--text, #ede8e0);
    }

    .st-desc {
      margin: 0 0 0.7rem;
      color: var(--text-dim, #8a8580);
      font-size: 0.85rem;
      line-height: 1.55;
    }

    .st-countries {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 0.6rem;
    }

    .st-country-chip {
      padding: 0.12rem 0.45rem;
      border: 1px solid;
      border-radius: 999px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.62rem;
      color: var(--text-dim, #8a8580);
      letter-spacing: 0.04em;
    }

    .st-flow {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  `
})
export class SpilloverTiersComponent {
  readonly tiers = input<SpilloverTier[]>([]);
}
