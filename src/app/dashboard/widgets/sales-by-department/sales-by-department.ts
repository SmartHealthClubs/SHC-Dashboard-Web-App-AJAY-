import { Component, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UIChart } from 'primeng/chart';
import { Tooltip } from 'primeng/tooltip';
import { apiDateRangeForPeriod } from '@/lib/period';
import { formatCurrency, sum } from '@/lib/format';
import { horizontalBarData, horizontalBarOptions } from '@/lib/chart-utils';
import { BAR_COLORS } from '@/lib/brand-colors';
import { ReportLink } from '@/dashboard/report-link/report-link';

// Mirrors the relevant fields from the Order Report (line-item) response —
// see docs/api/orders-report.md. Only the fields this widget actually uses;
// no member name/email/etc. are kept in state.
//
// NOTE: the PDF doc names this field "Barcode", but the live API actually
// returns it as "UserBarcode" — confirmed by inspecting a real response
// (docs/api/orders-report.md's field table is wrong here, not just
// differently-typed; this cost a real bug where every row silently read as
// undefined and classified as non-member). The API's "User*" prefix pattern
// also renames several other doc fields we don't currently use (e.g.
// AgreementNumber -> UserAgreementNumber, MemberName -> UserFullName).
type OrderReportRow = {
  Department: string;
  PaymentMethod: string;
  UserBarcode: string | null;
  TotalAmount: string | number;
};

type OrderReportResponse = {
  orderReports: OrderReportRow[];
  nextSkip: number;
  nextPage: boolean;
};

type DepartmentSales = {
  department: string;
  total: number;
  memberTotal: number;
  nonMemberTotal: number;
  byPaymentMethod: { method: string; amount: number }[];
};

// Safety cap against a runaway loop if the API ever gets stuck on nextPage=true.
const MAX_PAGES = 50;

// Money fields come back inconsistently typed live (plain numbers in some
// rows, "$"-prefixed or empty strings in others) — see docs/api/orders-report.md.
function parseMoney(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,]/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isMember(userBarcode: string | null): boolean {
  const trimmed = userBarcode?.trim() ?? '';
  return trimmed !== '' && trimmed !== 'Non-member';
}

@Component({
  selector: 'app-sales-by-department',
  imports: [UIChart, Tooltip, ReportLink],
  templateUrl: './sales-by-department.html',
})
export class SalesByDepartment {
  private readonly http = inject(HttpClient);
  readonly period = input.required<string>();

  protected readonly formatCurrency = formatCurrency;
  protected readonly rows = signal<DepartmentSales[]>([]);
  protected readonly chartData = signal(horizontalBarData([], [], BAR_COLORS));
  protected readonly chartOptions = horizontalBarOptions((v) => formatCurrency(v));
  protected readonly total = signal(0);

  constructor() {
    let requestId = 0;
    effect(() => {
      const period = this.period();
      const currentRequest = ++requestId;
      const { fromDate, toDate } = apiDateRangeForPeriod(period, new Date());

      this.load(fromDate, toDate).then((result) => {
        if (currentRequest !== requestId) return;
        this.rows.set(result);
        this.chartData.set(
          horizontalBarData(
            result.map((r) => r.department),
            result.map((r) => r.total),
            BAR_COLORS
          )
        );
        this.total.set(sum(result.map((r) => r.total)));
      });
    });
  }

  private async fetchAllOrderReportRows(fromDate: string, toDate: string): Promise<OrderReportRow[]> {
    const rows: OrderReportRow[] = [];
    let skip = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const params = {
        locations: '',
        // TODO: Manager department-scoping goes here once we know how the
        // logged-in user's departments are supplied — for now this widget is
        // always the Admin/all-club view (blank = "All").
        department: '',
        orderType: '',
        statusType: 'success',
        inventoryId: '',
        paymentMethod: '',
        fromDate,
        toDate,
        searchText: '',
        fetchFromDbOnly: 'false',
        skip: String(skip),
      };
      // fitnessCenterId is injected by the dev proxy from .env — see proxy.conf.js.
      const body = await firstValueFrom(
        this.http.get<OrderReportResponse>('/api/reports/orderReport', { params })
      );
      rows.push(...(body.orderReports ?? []));

      if (!body.nextPage) return rows;
      skip = body.nextSkip;
    }

    console.error(`[sales-by-department] stopped after ${MAX_PAGES} pages — API may be stuck on nextPage=true`);
    return rows;
  }

  // TODO: membership tier (VIP/Gold/etc.) is not available from the Order
  // Report — only member-vs-non-member (via UserBarcode) can be computed
  // today. A members/agreements report would be needed for tier — backend
  // gap, see docs/api/sales-by-department.md "Redesign feasibility".
  private aggregateByDepartment(rows: OrderReportRow[]): DepartmentSales[] {
    const byDepartment = new Map<
      string,
      { total: number; memberTotal: number; nonMemberTotal: number; byPaymentMethod: Map<string, number> }
    >();

    for (const row of rows) {
      const department = row.Department || 'Unknown';
      const amount = parseMoney(row.TotalAmount);
      const existing = byDepartment.get(department) ?? {
        total: 0,
        memberTotal: 0,
        nonMemberTotal: 0,
        byPaymentMethod: new Map<string, number>(),
      };

      existing.total += amount;
      if (isMember(row.UserBarcode)) {
        existing.memberTotal += amount;
      } else {
        existing.nonMemberTotal += amount;
      }

      const method = row.PaymentMethod || 'Unknown';
      existing.byPaymentMethod.set(method, (existing.byPaymentMethod.get(method) ?? 0) + amount);

      byDepartment.set(department, existing);
    }

    return Array.from(byDepartment.entries())
      .map(([department, values]) => ({
        department,
        total: values.total,
        memberTotal: values.memberTotal,
        nonMemberTotal: values.nonMemberTotal,
        byPaymentMethod: Array.from(values.byPaymentMethod.entries())
          .map(([method, amount]) => ({ method, amount }))
          .sort((a, b) => b.amount - a.amount),
      }))
      .sort((a, b) => b.total - a.total);
  }

  private async load(fromDate: string, toDate: string): Promise<DepartmentSales[]> {
    try {
      const orderRows = await this.fetchAllOrderReportRows(fromDate, toDate);
      return this.aggregateByDepartment(orderRows);
    } catch (err) {
      console.error('[sales-by-department] failed to load order report', err);
      return [];
    }
  }

  protected paymentMethodTooltip(row: DepartmentSales): string {
    return row.byPaymentMethod.map((pm) => `${pm.method}: ${formatCurrency(pm.amount)}`).join('<br>');
  }

  protected chartHeight(): string {
    return `${Math.max(120, this.rows().length * 44)}px`;
  }
}
