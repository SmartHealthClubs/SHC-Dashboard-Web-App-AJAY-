import { Component } from '@angular/core';
import { AiPlaceholderCard } from '../ai-placeholder-card/ai-placeholder-card';
import { Lightbulb } from '@/icons';

@Component({
  selector: 'app-highlights-placeholder',
  imports: [AiPlaceholderCard],
  template: `
    <app-ai-placeholder-card
      [icon]="Lightbulb"
      title="Highlights & Anomalies"
      description="Automatic insights and unusual-pattern alerts are on the way — you're all caught up for now."
    />
  `,
})
export class HighlightsPlaceholder {
  protected readonly Lightbulb = Lightbulb;
}
