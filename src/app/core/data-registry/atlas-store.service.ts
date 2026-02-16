import { computed, Injectable, signal } from '@angular/core';

import { AtlasSnapshot } from '../models/atlas.model';
import fallbackAtlas from '../../../assets/data/atlas.json';

@Injectable({ providedIn: 'root' })
export class AtlasStoreService {
  private readonly loadError = signal<string | null>(null);
  private readonly snapshotSignal = signal(fallbackAtlas as AtlasSnapshot);

  readonly snapshot = computed(() => this.snapshotSignal());
  readonly error = computed(() => this.loadError());
  readonly ready = computed(() => true);

  readonly sections = computed(() => this.snapshot().sections);
  readonly sources = computed(() => this.snapshot().sources);
  readonly evidence = computed(() => this.snapshot().evidence);
  readonly methodology = computed(() => this.snapshot().methodology);
  readonly interpretation = computed(() => this.snapshot()?.interpretation ?? null);
  readonly artifacts = computed(() => this.snapshot()?.artifacts ?? []);
  readonly apiHealth = computed(() => this.snapshot()?.api_health ?? null);
}
