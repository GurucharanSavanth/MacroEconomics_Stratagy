import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-evidence-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="evidence-card">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>{{ body }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-stroked-button color="primary" (click)="open.emit()">View Evidence</button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './evidence-card.component.scss'
})
export class EvidenceCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) body = '';
  @Output() open = new EventEmitter<void>();
}