import { Component, input } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-ai-placeholder-card',
  imports: [LucideAngularModule],
  templateUrl: './ai-placeholder-card.html',
})
export class AiPlaceholderCard {
  readonly icon = input.required<LucideIconData>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
