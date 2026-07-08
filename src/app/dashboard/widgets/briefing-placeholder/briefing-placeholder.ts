import { Component } from '@angular/core';
import { AiPlaceholderCard } from '../ai-placeholder-card/ai-placeholder-card';
import { Sparkles } from '@/icons';

@Component({
  selector: 'app-briefing-placeholder',
  imports: [AiPlaceholderCard],
  template: `
    <app-ai-placeholder-card
      [icon]="Sparkles"
      title="Morning Briefing"
      description="A personalized daily summary of what needs your attention is on the way. For now, everything you need is in the zones below."
    />
  `,
})
export class BriefingPlaceholder {
  protected readonly Sparkles = Sparkles;
}
