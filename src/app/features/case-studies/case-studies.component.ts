import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryCaseStudy } from '../../core/models/atlas.model';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cs-shell">
      <div class="cs-tabs">
        @for (study of studies(); track study.id) {
          <button
            class="cs-tab"
            [class.cs-tab--active]="activeStudy() === study.id"
            (click)="activeStudy.set(study.id)"
          >
            {{ study.country }}
          </button>
        }
      </div>

      @for (study of studies(); track study.id) {
        @if (activeStudy() === study.id) {
          <div class="cs-content">
            <div class="cs-narrative">
              <h3>{{ study.country }}</h3>
              <p class="cs-text">{{ study.narrative }}</p>
              <div class="cs-keyfact">
                <span class="cs-keyfact__icon">!</span>
                <span>{{ study.keyFact }}</span>
              </div>
            </div>
            <div class="cs-metrics">
              @for (metric of study.metrics; track metric.label) {
                <div class="cs-metric">
                  <div class="cs-metric__header">
                    <span class="cs-metric__label">{{ metric.label }}</span>
                    <span class="cs-metric__value" [style.color]="metric.color">
                      {{ metric.value }}{{ metric.unit }}
                    </span>
                  </div>
                  <div class="cs-metric__bar-bg">
                    <div
                      class="cs-metric__bar-fill"
                      [style.width.%]="(metric.value / metric.max) * 100"
                      [style.background]="metric.color"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './case-studies.component.scss'
})
export class CaseStudiesComponent {
  readonly studies = input<CountryCaseStudy[]>([]);
  readonly activeStudy = signal('cs-lka');
}
