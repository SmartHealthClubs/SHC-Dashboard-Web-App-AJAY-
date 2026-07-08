import { Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import { SCOPE_LABELS } from '@/lib/scope';
import { ROLE_LABELS } from '@/lib/roles';
import type { ResolvedWidget } from '@/lib/dashboard';

const RENDER_MODE_LABELS: Record<string, string> = {
  stat: 'Stat',
  feed: 'Feed',
  custom: 'Custom',
  placeholder: 'Coming soon',
};

@Component({
  selector: 'app-widget-placeholder-card',
  imports: [Tag],
  templateUrl: './widget-placeholder-card.html',
})
export class WidgetPlaceholderCard {
  readonly resolved = input.required<ResolvedWidget>();

  protected readonly isPlaceholder = computed(() => this.resolved().widget.renderMode === 'placeholder');
  protected readonly renderModeLabel = computed(() => RENDER_MODE_LABELS[this.resolved().widget.renderMode]);
  protected readonly scopeLabel = computed(() => SCOPE_LABELS[this.resolved().scope]);
  protected readonly unlockedByLabel = computed(() =>
    this.resolved().unlockedBy.map((r) => ROLE_LABELS[r]).join(', ')
  );
}
