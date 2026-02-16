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

interface NetworkNode {
  id: string;
  group: string;
  weight: number;
}

interface NetworkLink {
  source: string;
  target: string;
  weight: number;
}

@Component({
  selector: 'app-currency-network',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="network-shell">
      <header>
        <h3>{{ title() }}</h3>
        <p>{{ subtitle() }}</p>
      </header>
      <svg #svgHost class="network-canvas" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid meet"></svg>
    </section>
  `,
  styleUrl: './currency-network.component.scss'
})
export class CurrencyNetworkComponent implements AfterViewInit, OnDestroy {
  readonly title = input('Currency Spillover Network Core');
  readonly subtitle = input(
    'Core currencies concentrate cross-border spillover channels; edge thickness reflects channel intensity.'
  );
  readonly nodes = input<NetworkNode[]>([]);
  readonly links = input<NetworkLink[]>([]);

  @ViewChild('svgHost', { static: true })
  private readonly svgHost?: ElementRef<SVGElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private simulationStop: (() => void) | null = null;

  constructor() {
    effect(() => {
      const nodes = this.nodes();
      const links = this.links();
      if (!nodes.length || !links.length || !this.svgHost || !isPlatformBrowser(this.platformId)) {
        return;
      }
      this.renderNetwork(nodes, links);
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.nodes().length && this.links().length) {
      this.renderNetwork(this.nodes(), this.links());
    }
  }

  ngOnDestroy() {
    this.simulationStop?.();
  }

  private async renderNetwork(nodes: NetworkNode[], links: NetworkLink[]) {
    const d3 = await import('d3');
    const host = this.svgHost?.nativeElement;
    if (!host) {
      return;
    }
    const svg = d3.select<SVGElement, unknown>(host);

    svg.selectAll('*').remove();
    this.simulationStop?.();

    const width = 800;
    const height = 460;

    const color = d3
      .scaleOrdinal<string, string>()
      .domain(['Core', 'Bridge', 'Periphery'])
      .range(['#c83e4d', '#0e7c86', '#db9e36']);

    const simulationNodes = nodes.map((node) => ({ ...node })) as Array<
      d3.SimulationNodeDatum & NetworkNode
    >;
    const simulationLinks = links.map((link) => ({ ...link })) as Array<
      d3.SimulationLinkDatum<d3.SimulationNodeDatum> & NetworkLink
    >;

    const simulation = d3
      .forceSimulation(simulationNodes)
      .force(
        'link',
        d3.forceLink(simulationLinks).id((node: any) => node.id)
          .distance((link: any) => 120 - Math.min(link.weight, 25) * 2)
      )
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((node: any) => Math.max(20, node.weight * 0.2 + 18)));

    const linkSelection = svg
      .append('g')
      .attr('stroke', '#4a4a6a')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(simulationLinks)
      .join('line')
      .attr('stroke-width', (link) => Math.max(1.5, link.weight * 0.25));

    const nodeSelection = svg
      .append('g')
      .selectAll('circle')
      .data(simulationNodes)
      .join('circle')
      .attr('r', (node) => Math.max(12, node.weight * 0.16))
      .attr('fill', (node) => color(node.group))
      .attr('stroke', '#2e2e50')
      .attr('stroke-width', 1.25);

    const labelSelection = svg
      .append('g')
      .selectAll('text')
      .data(simulationNodes)
      .join('text')
      .text((node) => node.id)
      .attr('font-family', 'Space Grotesk, sans-serif')
      .attr('font-size', '13px')
      .attr('fill', '#ede8e0')
      .attr('text-anchor', 'middle')
      .attr('dy', 4);

    simulation.on('tick', () => {
      linkSelection
        .attr('x1', (link: any) => link.source.x)
        .attr('y1', (link: any) => link.source.y)
        .attr('x2', (link: any) => link.target.x)
        .attr('y2', (link: any) => link.target.y);

      nodeSelection.attr('cx', (node: any) => node.x).attr('cy', (node: any) => node.y);

      labelSelection.attr('x', (node: any) => node.x).attr('y', (node: any) => node.y);
    });

    this.simulationStop = () => simulation.stop();
  }
}
