import { computed, Injectable, inject } from '@angular/core';

import { AtlasStoreService } from './atlas-store.service';
import { AtlasEvidence, AtlasSource } from '../models/atlas.model';

@Injectable({ providedIn: 'root' })
export class DataRegistryService {
  private readonly atlasStore = inject(AtlasStoreService);

  readonly sourceMap = computed(() => {
    const map = new Map<string, AtlasSource>();
    for (const source of this.atlasStore.sources()) {
      map.set(source.id, source);
    }
    return map;
  });

  readonly evidenceMap = computed(() => {
    const map = new Map<string, AtlasEvidence>();
    for (const evidence of this.atlasStore.evidence()) {
      map.set(evidence.id, evidence);
    }
    return map;
  });

  getSources(ids: string[]) {
    return ids
      .map((id) => this.sourceMap().get(id))
      .filter((source): source is NonNullable<typeof source> => Boolean(source));
  }

  getEvidence(id: string) {
    return this.evidenceMap().get(id) ?? null;
  }
}
