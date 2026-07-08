import { Component, computed, inject, input } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { LucideAngularModule } from 'lucide-angular';
import { TrendingDown, TrendingUp } from '@/icons';
import { LOYALTY_POINTS, LOYALTY_SUMMARY } from '@/mock/loyalty';
import { hasLoyaltyFeature } from '@/mock/locations';
import { LocationService } from '@/services/location.service';
import { percentChange, trendLabel, trendWindows, weekIndexesForPeriod } from '@/lib/period';
import { formatPercent, sum } from '@/lib/format';
import { sparklineData, SPARKLINE_OPTIONS } from '@/lib/chart-utils';
import { BRAND_GOLD, BRAND_PALE } from '@/lib/brand-colors';
import { ReportLink } from '@/dashboard/report-link/report-link';
import type { ScopeLevel } from '@/lib/scope';

// Loyalty is a club-wide program, not owned by a department — Manager scope
// filters by location only (same treatment as shared/undeparted resources
// elsewhere in the app).
function scopedToLocation<T extends { locationId: string }>(
  rows: T[],
  scope: ScopeLevel,
  locationId: string
): T[] {
  if (scope === 'all') return rows;
  return rows.filter((r) => r.locationId === locationId);
}

@Component({
  selector: 'app-loyalty-points',
  imports: [UIChart, LucideAngularModule, ReportLink],
  templateUrl: './loyalty-points.html',
})
export class LoyaltyPoints {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();
  readonly period = input.required<string>();

  protected readonly SPARKLINE_OPTIONS = SPARKLINE_OPTIONS;

  protected readonly enabled = computed(
    () => this.scope() === 'all' || hasLoyaltyFeature(this.locationService.locationId(), 'points')
  );

  protected readonly data = computed(() => {
    const scope = this.scope();
    const period = this.period();
    const locationId = this.locationService.locationId();

    const summary = scopedToLocation(LOYALTY_SUMMARY, scope, locationId);
    const points = scopedToLocation(LOYALTY_POINTS, scope, locationId);

    const weeks = weekIndexesForPeriod(period);
    const periodSummary = summary.filter((r) => weeks.includes(r.weekIndex));

    const { current, previous } = trendWindows(period);
    const currentTotal = sum(summary.filter((r) => current.includes(r.weekIndex)).map((r) => r.totalAwarded));
    const previousTotal = sum(summary.filter((r) => previous.includes(r.weekIndex)).map((r) => r.totalAwarded));

    const byWeek = new Map<number, number>();
    for (const row of summary) {
      byWeek.set(row.weekIndex, (byWeek.get(row.weekIndex) ?? 0) + row.totalAwarded);
    }
    const sparklineValues = Array.from(byWeek.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, awarded]) => awarded);

    const recentMoments = [...points].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

    return {
      totalAwarded: sum(periodSummary.map((r) => r.totalAwarded)),
      totalRedeemed: sum(periodSummary.map((r) => r.totalRedeemed)),
      totalExpiring: sum(periodSummary.map((r) => r.totalExpiring)),
      trendPct: percentChange(currentTotal, previousTotal),
      sparklineValues,
      recentMoments,
    };
  });

  protected readonly chartData = computed(() =>
    sparklineData(this.data().sparklineValues, BRAND_GOLD, BRAND_PALE)
  );

  protected readonly isUp = computed(() => this.data().trendPct >= 0);
  protected readonly TrendingUp = TrendingUp;
  protected readonly TrendingDown = TrendingDown;
  protected readonly formatPercent = formatPercent;
  protected readonly trendLabel = computed(() => trendLabel(this.period()));
}
