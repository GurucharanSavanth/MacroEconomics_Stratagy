import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
  input
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-chart-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="chart-shell">
      <header>
        <h3>{{ title() }}</h3>
        @if (subtitle()) {
          <p>{{ subtitle() }}</p>
        }
      </header>
      <div class="chart-host" #chartHost></div>
    </section>
  `,
  styleUrl: './chart-shell.component.scss'
})
export class ChartShellComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly options = input<Record<string, unknown> | null>(null);

  @ViewChild('chartHost', { static: true })
  private readonly chartHost?: ElementRef<HTMLDivElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private chartInstance: { setOption: Function; resize: Function; dispose: Function } | null = null;
  private removeResizeListener: (() => void) | null = null;

  constructor() {
    effect(() => {
      const options = this.options();
      if (options && this.chartInstance) {
        this.chartInstance.setOption(options, true);
      }
    });
  }

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId) || !this.chartHost?.nativeElement) {
      return;
    }

    const echarts = await import('echarts');
    this.chartInstance = echarts.init(this.chartHost.nativeElement);

    const currentOptions = this.options();
    if (currentOptions) {
      this.chartInstance.setOption(currentOptions, true);
    }

    const onResize = () => this.chartInstance?.resize();
    window.addEventListener('resize', onResize);
    this.removeResizeListener = () => window.removeEventListener('resize', onResize);
  }

  ngOnDestroy() {
    this.removeResizeListener?.();
    this.chartInstance?.dispose();
  }
}