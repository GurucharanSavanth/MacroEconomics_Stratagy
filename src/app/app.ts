import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AtlasStoreService } from './core/data-registry/atlas-store.service';
import { DataRegistryService } from './core/data-registry/data-registry.service';
import { ChartShellComponent } from './shared/chart-shell/chart-shell.component';
import { EvidenceCardComponent } from './shared/evidence-card/evidence-card.component';
import { EvidenceDialogComponent } from './shared/evidence-dialog/evidence-dialog.component';
import { CurrencyNetworkComponent } from './features/currency-network/currency-network.component';
import { CaseStudiesComponent } from './features/case-studies/case-studies.component';
import { KeyFactsComponent } from './features/key-facts/key-facts.component';
import { SpilloverTiersComponent } from './features/spillover-tiers/spillover-tiers.component';
import { SpillbackLoopComponent } from './features/spillback-loop/spillback-loop.component';

import {
  HERO_STATS,
  TICKER_CRISIS_DATA,
  KEY_FACTS,
  CASE_STUDIES,
  SPILLOVER_TIERS,
  SPILLBACK_STEPS,
  RATE_TIMELINE,
  CURRENCY_DEPRECIATION,
  CAPITAL_FLOW_DONUT,
  EXPLAINER_MECHANISMS,
  RICH_SOURCES
} from './core/data-registry/editorial-content';

/* Shared dark-theme axis/tooltip config */
const DARK_AXIS = {
  axisLabel: { color: '#8a8580' },
  axisLine: { lineStyle: { color: '#2e2e50' } },
  splitLine: { lineStyle: { color: '#1e1e38' } },
  nameTextStyle: { color: '#8a8580' }
};

const DARK_TOOLTIP = {
  backgroundColor: 'rgba(20,20,37,0.95)',
  borderColor: '#2e2e50',
  textStyle: { color: '#ede8e0' }
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDialogModule,
    ChartShellComponent,
    EvidenceCardComponent,
    CurrencyNetworkComponent,
    CaseStudiesComponent,
    KeyFactsComponent,
    SpilloverTiersComponent,
    SpillbackLoopComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  @ViewChildren('atlasSection', { read: ElementRef })
  private readonly sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  protected readonly atlasStore = inject(AtlasStoreService);
  protected readonly dataRegistry = inject(DataRegistryService);
  private readonly dialog = inject(MatDialog);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly mode = signal<'story' | 'explore'>('story');
  protected readonly activeSection = signal('hero');
  protected readonly selectedRegion = signal('All regions');
  protected readonly selectedYear = signal<number>(2024);
  protected readonly shockIntensity = signal(50);
  protected readonly artifactStatus = signal<'all' | 'ok' | 'failed'>('all');
  protected readonly artifactCategory = signal('all');

  /* Editorial content from reference HTML */
  protected readonly heroStats = HERO_STATS;
  protected readonly keyFacts = KEY_FACTS;
  protected readonly caseStudies = CASE_STUDIES;
  protected readonly spilloverTiers = SPILLOVER_TIERS;
  protected readonly spillbackSteps = SPILLBACK_STEPS;
  protected readonly explainerMechanisms = EXPLAINER_MECHANISMS;
  protected readonly richSources = RICH_SOURCES;
  protected readonly currencyDepreciation = CURRENCY_DEPRECIATION;

  protected readonly sectionOrder = [
    { id: 'hero', label: 'Global pulse' },
    { id: 'explainer', label: 'Mechanism' },
    { id: 'facts', label: 'Key facts' },
    { id: 'timeline', label: 'Rate timeline' },
    { id: 'sync', label: 'Synchronization' },
    { id: 'channels', label: 'Transmission' },
    { id: 'tiers', label: 'Spillover tiers' },
    { id: 'depreciation', label: 'Currency shock' },
    { id: 'stress', label: 'Country stress' },
    { id: 'cases', label: 'Case studies' },
    { id: 'network', label: 'Network core' },
    { id: 'spillback', label: 'Spillback loop' },
    { id: 'methodology', label: 'Methodology' }
  ];

  protected readonly snapshot = this.atlasStore.snapshot;
  protected readonly sections = this.atlasStore.sections;
  protected readonly sources = this.atlasStore.sources;
  protected readonly evidence = this.atlasStore.evidence;
  protected readonly methodology = this.atlasStore.methodology;
  protected readonly interpretation = this.atlasStore.interpretation;
  protected readonly artifacts = this.atlasStore.artifacts;
  protected readonly apiHealth = this.atlasStore.apiHealth;

  protected readonly regionOptions = computed(() => {
    const countries = this.sections().country_stress.countries;
    const regions = [...new Set(countries.map((country) => country.region))].sort();
    return ['All regions', ...regions];
  });

  protected readonly availableYears = computed(() => this.sections().country_stress.years);

  protected readonly tickerItems = computed(() => {
    return TICKER_CRISIS_DATA;
  });

  protected readonly artifactCategories = computed(() => {
    const categories = [...new Set(this.artifacts().map((artifact) => artifact.category))].sort();
    return ['all', ...categories];
  });

  protected readonly filteredArtifacts = computed(() => {
    const status = this.artifactStatus();
    const category = this.artifactCategory();
    return this.artifacts().filter((artifact) => {
      const statusMatch = status === 'all' || artifact.status === status;
      const categoryMatch = category === 'all' || artifact.category === category;
      return statusMatch && categoryMatch;
    });
  });

  protected readonly artifactSummary = computed(() => {
    const all = this.artifacts();
    const ok = all.filter((artifact) => artifact.status === 'ok').length;
    const failed = all.filter((artifact) => artifact.status === 'failed').length;
    return {
      total: all.length,
      ok,
      failed
    };
  });

  protected readonly filteredCountryPoints = computed(() => {
    const section = this.sections().country_stress;

    const selectedYear = this.selectedYear();
    const selectedRegion = this.selectedRegion();

    return section.countries
      .filter((country) => selectedRegion === 'All regions' || country.region === selectedRegion)
      .map((country) => {
        const yearIndex = country.years.indexOf(selectedYear);
        if (yearIndex === -1) {
          return null;
        }

        const debtService = country.debtService[yearIndex];
        const usdDebtShare = country.usdDebtShare[yearIndex];
        const interestPayments = country.interestPayments[yearIndex];

        if (debtService === null || usdDebtShare === null) {
          return null;
        }

        const stressScore = Number((0.6 * debtService + 0.4 * usdDebtShare).toFixed(2));

        return {
          iso3: country.iso3,
          country: country.name,
          region: country.region,
          debtService,
          usdDebtShare,
          interestPayments,
          stressScore
        };
      })
      .filter((point): point is NonNullable<typeof point> => Boolean(point));
  });

  protected readonly stressRanking = computed(() => {
    const points = this.filteredCountryPoints();
    return [...points].sort((a, b) => b.stressScore - a.stressScore).slice(0, 10);
  });

  protected readonly simulationRanking = computed(() => {
    const multiplier = 1 + this.shockIntensity() / 150;
    return [...this.stressRanking()]
      .map((row) => ({
        ...row,
        simulatedStress: Number((row.stressScore * multiplier).toFixed(2))
      }))
      .sort((a, b) => b.simulatedStress - a.simulatedStress)
      .slice(0, 8);
  });

  /* ─── CHART OPTIONS (all dark-themed) ─── */

  protected readonly heatmapOptions = computed(() => {
    const section = this.sections().global_sync;

    const data = section.heatmap_matrix.flatMap((row, rowIndex) =>
      row
        .map((value, columnIndex) =>
          value === null ? null : [columnIndex, rowIndex, Number(value.toFixed(2))]
        )
        .filter((entry): entry is [number, number, number] => Boolean(entry))
    );

    const values = data.map((entry) => entry[2]);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        position: 'top'
      },
      grid: {
        top: 16,
        left: 130,
        right: 24,
        bottom: 32
      },
      xAxis: {
        type: 'category',
        data: section.periods,
        axisLabel: { rotate: 35, color: '#8a8580' },
        axisLine: { lineStyle: { color: '#2e2e50' } }
      },
      yAxis: {
        type: 'category',
        data: section.banks,
        inverse: true,
        axisLabel: { color: '#8a8580' },
        axisLine: { lineStyle: { color: '#2e2e50' } }
      },
      visualMap: {
        min,
        max,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        calculable: true,
        textStyle: { color: '#8a8580' },
        inRange: {
          color: ['#0a2a2e', '#0e7c86', '#c9a84c', '#e84040']
        }
      },
      series: [
        {
          type: 'heatmap',
          data,
          itemStyle: { borderColor: '#141425', borderWidth: 1 }
        }
      ]
    };
  });

  protected readonly tsiOptions = computed(() => {
    const section = this.sections().global_sync;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'axis'
      },
      legend: {
        top: 0,
        data: ['Hiking share', 'Cutting share', 'Dispersion (IQR)'],
        textStyle: { color: '#8a8580' }
      },
      grid: {
        left: 50,
        right: 54,
        top: 36,
        bottom: 24
      },
      xAxis: {
        type: 'category',
        data: section.tsi.map((point) => point.period),
        ...DARK_AXIS
      },
      yAxis: [
        {
          type: 'value',
          name: '% of tracked CBs',
          ...DARK_AXIS
        },
        {
          type: 'value',
          name: 'pp',
          ...DARK_AXIS,
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'Hiking share',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          data: section.tsi.map((point) => point.hikingShare),
          color: '#e84040'
        },
        {
          name: 'Cutting share',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          data: section.tsi.map((point) => point.cuttingShare),
          color: '#00c9a7'
        },
        {
          name: 'Dispersion (IQR)',
          type: 'bar',
          yAxisIndex: 1,
          data: section.tsi.map((point) => point.dispersion),
          color: '#c9a84c',
          barMaxWidth: 18,
          opacity: 0.8
        }
      ]
    };
  });

  protected readonly liquidityOptions = computed(() => {
    const section = this.sections().liquidity_channel;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'axis'
      },
      legend: {
        top: 0,
        data: ['USD index', 'EUR index', 'JPY index'],
        textStyle: { color: '#8a8580' }
      },
      grid: {
        left: 48,
        right: 32,
        top: 34,
        bottom: 20
      },
      xAxis: {
        type: 'category',
        data: section.periods,
        ...DARK_AXIS
      },
      yAxis: {
        type: 'value',
        name: 'Index (base=100)',
        ...DARK_AXIS
      },
      series: [
        {
          name: 'USD index',
          type: 'line',
          smooth: true,
          data: section.usd_index,
          color: '#e84040'
        },
        {
          name: 'EUR index',
          type: 'line',
          smooth: true,
          data: section.eur_index,
          color: '#00c9a7'
        },
        {
          name: 'JPY index',
          type: 'line',
          smooth: true,
          data: section.jpy_index,
          color: '#c9a84c'
        }
      ]
    };
  });

  protected readonly sankeyOptions = computed(() => {
    const section = this.sections().liquidity_channel;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'item'
      },
      series: [
        {
          type: 'sankey',
          data: section.sankey.nodes.map((n) => ({
            ...n,
            itemStyle: { color: '#c9a84c', borderColor: '#2e2e50' }
          })),
          links: section.sankey.links,
          emphasis: {
            focus: 'adjacency'
          },
          label: { color: '#ede8e0' },
          lineStyle: {
            color: 'gradient',
            curveness: 0.5
          }
        }
      ]
    };
  });

  protected readonly stressScatterOptions = computed(() => {
    const points = this.filteredCountryPoints();

    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'item',
        formatter: (params: any) => {
          const [x, y, country, stress] = params.data;
          return `<strong>${country}</strong><br/>USD debt share: ${x}%<br/>Debt service: ${y}%<br/>Stress score: ${stress}`;
        }
      },
      grid: {
        left: 50,
        right: 26,
        top: 24,
        bottom: 36
      },
      xAxis: {
        name: 'USD debt share (%)',
        type: 'value',
        ...DARK_AXIS
      },
      yAxis: {
        name: 'Debt service / exports (%)',
        type: 'value',
        ...DARK_AXIS
      },
      visualMap: {
        min: 0,
        max: 120,
        dimension: 3,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        textStyle: { color: '#8a8580' },
        inRange: {
          color: ['#00c9a7', '#c9a84c', '#e84040']
        }
      },
      series: [
        {
          type: 'scatter',
          symbolSize: (val: number[]) => Math.max(8, Math.min(36, val[3] / 2.2)),
          data: points.map((point) => [
            point.usdDebtShare,
            point.debtService,
            point.country,
            point.stressScore
          ]),
          label: {
            show: true,
            formatter: (params: any) => params.data[2],
            position: 'right',
            color: '#8a8580',
            fontSize: 10
          }
        }
      ]
    };
  });

  protected readonly dominantCurrencyOptions = computed(() => {
    const section = this.sections().dominant_currency;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'axis'
      },
      grid: {
        left: 44,
        right: 22,
        top: 24,
        bottom: 32
      },
      xAxis: {
        type: 'category',
        data: section.cofer_usd_share.map((point) => point.period),
        ...DARK_AXIS
      },
      yAxis: {
        type: 'value',
        name: '% share',
        ...DARK_AXIS
      },
      series: [
        {
          type: 'line',
          smooth: true,
          name: 'COFER USD share',
          data: section.cofer_usd_share.map((point) => point.value),
          color: '#c9a84c',
          areaStyle: { color: 'rgba(201,168,76,0.08)' },
          markLine: {
            lineStyle: {
              color: '#e84040',
              type: 'dashed'
            },
            label: { color: '#8a8580' },
            data: section.methodology_breaks.map((breakPoint) => ({
              xAxis: breakPoint.period,
              label: {
                formatter: '2025-Q3 break'
              }
            }))
          }
        }
      ]
    };
  });

  /* ─── NEW CHART: Rate Hike Timeline ─── */
  protected readonly rateTimelineOptions = computed(() => {
    const data = RATE_TIMELINE;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'axis'
      },
      legend: {
        top: 0,
        data: ['Federal Reserve', 'ECB', 'Bank of England', 'Bank of Japan'],
        textStyle: { color: '#8a8580' }
      },
      grid: {
        left: 44,
        right: 22,
        top: 42,
        bottom: 24
      },
      xAxis: {
        type: 'category',
        data: data.map((p) => p.date),
        ...DARK_AXIS
      },
      yAxis: {
        type: 'value',
        name: 'Policy rate (%)',
        ...DARK_AXIS
      },
      series: [
        {
          name: 'Federal Reserve',
          type: 'line',
          smooth: true,
          data: data.map((p) => p.fed),
          color: '#e84040',
          lineStyle: { width: 3 },
          areaStyle: { color: 'rgba(232,64,64,0.06)' }
        },
        {
          name: 'ECB',
          type: 'line',
          smooth: true,
          data: data.map((p) => p.ecb),
          color: '#4a90e2'
        },
        {
          name: 'Bank of England',
          type: 'line',
          smooth: true,
          data: data.map((p) => p.boe),
          color: '#c9a84c'
        },
        {
          name: 'Bank of Japan',
          type: 'line',
          smooth: true,
          data: data.map((p) => p.boj),
          color: '#00c9a7',
          lineStyle: { type: 'dashed' }
        }
      ]
    };
  });

  /* ─── NEW CHART: Currency Depreciation Bar ─── */
  protected readonly depreciationBarOptions = computed(() => {
    const data = CURRENCY_DEPRECIATION;
    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'axis'
      },
      grid: {
        left: 90,
        right: 32,
        top: 16,
        bottom: 24
      },
      xAxis: {
        type: 'value',
        name: 'Depreciation vs USD (%)',
        ...DARK_AXIS
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.country),
        inverse: true,
        axisLabel: { color: '#ede8e0' },
        axisLine: { lineStyle: { color: '#2e2e50' } }
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.depreciation,
            itemStyle: { color: d.color }
          })),
          barMaxWidth: 20,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: '#8a8580',
            fontSize: 11
          }
        }
      ]
    };
  });

  /* ─── NEW CHART: Capital Flow Donut ─── */
  protected readonly capitalFlowDonutOptions = computed(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        ...DARK_TOOLTIP,
        trigger: 'item',
        formatter: '{b}: {c}% ({d}%)'
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#8a8580' }
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '70%'],
          center: ['50%', '45%'],
          data: CAPITAL_FLOW_DONUT.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color }
          })),
          label: {
            color: '#8a8580',
            fontSize: 11
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#ede8e0'
            }
          }
        }
      ]
    };
  });

  private sectionObserver: IntersectionObserver | null = null;

  constructor() {
    effect(() => {
      const years = this.availableYears();
      if (!years.length) {
        return;
      }

      if (!years.includes(this.selectedYear())) {
        this.selectedYear.set(years[years.length - 1]);
      }
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.bindSectionObserver();
    this.sectionRefs.changes.subscribe(() => this.bindSectionObserver());
  }

  protected setMode(value: 'story' | 'explore') {
    this.mode.set(value);
  }

  protected setRegion(value: string) {
    this.selectedRegion.set(value);
  }

  protected setYearFromInput(value: string) {
    const year = Number.parseInt(value, 10);
    if (Number.isFinite(year)) {
      this.selectedYear.set(year);
    }
  }

  protected setShockIntensity(value: string) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      this.shockIntensity.set(parsed);
    }
  }

  protected setArtifactStatus(value: string) {
    if (value === 'ok' || value === 'failed' || value === 'all') {
      this.artifactStatus.set(value);
    }
  }

  protected setArtifactCategory(value: string) {
    this.artifactCategory.set(value || 'all');
  }

  protected jumpTo(sectionId: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected openEvidence(evidenceId: string) {
    const evidence = this.dataRegistry.getEvidence(evidenceId);
    if (!evidence) {
      return;
    }

    const sources = this.dataRegistry.getSources(evidence.source_ids);

    this.dialog.open(EvidenceDialogComponent, {
      width: 'min(740px, 95vw)',
      data: {
        evidence,
        sources
      }
    });
  }

  protected sourceByIds(sourceIds: string[]) {
    return this.dataRegistry.getSources(sourceIds);
  }

  protected sectionInterpretation(sectionId: string) {
    return this.interpretation()?.section_notes.find((note) => note.section_id === sectionId) ?? null;
  }

  private bindSectionObserver() {
    this.sectionObserver?.disconnect();

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const id = active?.target.getAttribute('id');
        if (id) {
          this.activeSection.set(id);
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: '-30% 0px -45% 0px'
      }
    );

    for (const section of this.sectionRefs.toArray()) {
      this.sectionObserver.observe(section.nativeElement);
    }
  }
}
