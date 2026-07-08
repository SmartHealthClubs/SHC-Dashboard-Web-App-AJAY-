import { Component, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UIChart } from 'primeng/chart';
import { LucideAngularModule } from 'lucide-angular';
import { TrendingDown, TrendingUp } from '@/icons';
import { apiDateRangeForPeriod, trendLabel } from '@/lib/period';
import { formatCurrency, formatPercent } from '@/lib/format';
import { sparklineData, SPARKLINE_OPTIONS } from '@/lib/chart-utils';
import { BRAND_BLUE, BRAND_PALE } from '@/lib/brand-colors';
import { ReportLink } from '@/dashboard/report-link/report-link';

// Mirrors the response shape in docs/api/orders-report.md.
type OrderStatistics = {
  totalTransactions: number;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  stripeFeeAmount: number;
  convenienceFeeAmount: number;
  clubAmount: number;
  memoryUsage: string;
};

type RevenueData = {
  totalAmount: number;
  clubAmount: number;
  totalTransactions: number;
  failedAmount: number;
  refundedAmount: number;
  trendPct: number;
  sparklineValues: number[];
};

const EMPTY_DATA: RevenueData = {
  totalAmount: 0,
  clubAmount: 0,
  totalTransactions: 0,
  failedAmount: 0,
  refundedAmount: 0,
  trendPct: 0,
  sparklineValues: [],
};

@Component({
  selector: 'app-revenue-glance',
  imports: [UIChart, LucideAngularModule, ReportLink],
  templateUrl: './revenue-glance.html',
})
export class RevenueGlance {
  private readonly http = inject(HttpClient);
  readonly period = input.required<string>();

  protected readonly SPARKLINE_OPTIONS = SPARKLINE_OPTIONS;
  protected readonly TrendingUp = TrendingUp;
  protected readonly TrendingDown = TrendingDown;
  protected readonly formatCurrency = formatCurrency;
  protected readonly formatPercent = formatPercent;

  protected readonly data = signal<RevenueData>(EMPTY_DATA);
  protected readonly chartData = signal(sparklineData([0, 0], BRAND_BLUE, BRAND_PALE));
  protected readonly trendLabelText = signal('');

  constructor() {
    // Re-fetches whenever `period` changes; a request-id guard discards any
    // response that resolves after a newer request has already started —
    // the same "ignore stale responses" behavior the React version got for
    // free from its useEffect cleanup's `cancelled` flag.
    let requestId = 0;
    effect(() => {
      const period = this.period();
      const currentRequest = ++requestId;
      const { fromDate, toDate } = apiDateRangeForPeriod(period, new Date());

      this.load(fromDate, toDate).then((result) => {
        if (currentRequest !== requestId) return;
        this.data.set(result);
        this.chartData.set(sparklineData(result.sparklineValues, BRAND_BLUE, BRAND_PALE));
        this.trendLabelText.set(trendLabel(period));
      });
    });
  }

  private fetchOrderStatistics(
    statusType: 'success' | 'failed' | 'refunded',
    fromDate: string,
    toDate: string
  ): Promise<OrderStatistics> {
    const params = {
      locations: '',
      // TODO: Manager department-scoping goes here once we know how the
      // logged-in user's departments are supplied — for now this widget is
      // always the Admin/all-club view (blank = "All", per the API doc).
      department: '',
      orderType: '',
      statusType,
      inventoryId: '',
      paymentMethod: '',
      fromDate,
      toDate,
      searchText: '',
      fetchFromDbOnly: 'false',
      skip: '0',
    };
    // fitnessCenterId is injected by the dev proxy from .env — see proxy.conf.js.
    return firstValueFrom(
      this.http.get<OrderStatistics>('/api/reports/orderStatistics', { params })
    );
  }

  private async load(fromDate: string, toDate: string): Promise<RevenueData> {
    try {
      const [success, failed, refunded] = await Promise.all([
        this.fetchOrderStatistics('success', fromDate, toDate),
        this.fetchOrderStatistics('failed', fromDate, toDate),
        this.fetchOrderStatistics('refunded', fromDate, toDate),
      ]);
      return {
        totalAmount: success.totalAmount,
        clubAmount: success.clubAmount,
        totalTransactions: success.totalTransactions,
        failedAmount: failed.totalAmount,
        refundedAmount: refunded.totalAmount,
        // TODO: a real trend needs a second call for the prior period — out
        // of scope for this pass (see docs/api/orders-report.md), so this
        // stays flat until that's wired.
        trendPct: 0,
        sparklineValues: [success.totalAmount, success.totalAmount],
      };
    } catch (err) {
      console.error('[revenue-glance] failed to load order statistics', err);
      return EMPTY_DATA;
    }
  }

  protected isUp(): boolean {
    return this.data().trendPct >= 0;
  }
}
