import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { AtlasEvidence, AtlasSource } from '../../core/models/atlas.model';

export interface EvidenceDialogData {
  evidence: AtlasEvidence;
  sources: AtlasSource[];
}

@Component({
  selector: 'app-evidence-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatChipsModule, DatePipe],
  templateUrl: './evidence-dialog.component.html',
  styleUrl: './evidence-dialog.component.scss'
})
export class EvidenceDialogComponent {
  readonly data = inject<EvidenceDialogData>(MAT_DIALOG_DATA);
}