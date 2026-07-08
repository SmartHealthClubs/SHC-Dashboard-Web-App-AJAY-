import { Component, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UIChart } from 'primeng/chart';
import { Tag } from 'primeng/tag';
import { LucideAngularModule } from 'lucide-angular';
import { TrendingDown, TrendingUp } from '@/icons';
import { apiDateRangeForPeriod, trendLabel } from '@/lib/period';
import { formatPercent } from '@/lib/format';
import { sparklineData, SPARKLINE_OPTIONS } from '@/lib/chart-utils';
import { BRAND_CYAN, BRAND_PALE } from '@/lib/brand-colors';
import { ReportLink } from '@/dashboard/report-link/report-link';

// The PDF (docs/api/attendance-and-fill.md) documents top-level summary
// totals (totalAttendees/totalNonAttendee/etc.) on this endpoint, but a live
// check found they DO NOT exist in this API version — the response only has
// skip/nextSkip/nextPage at the top level, across every status/date variant
// tried. So this widget pages through bookingMembers[] and rolls the counts
// up client-side instead.
//
// Only status/boolean fields are read here — no member-identity fields
// (live has renamed those to UserFullName/UserBarcode/UserEmail/etc., none
// of which this widget needs).
//
// Live enum values (confirmed by inspecting a real response — NOT what the
// PDF states, which uses different casing/wording like "Attended"/"No Show"):
//   AttendanceStatus: "" (unmarked/upcoming) | "attended" | "not-attended"
//   BookingStatus: "confirmed" | "cancelled" | "transferred"
type BookingMemberRow = {
  AttendanceStatus: string;
  BookingStatus: string;
  IsLateCancelled: boolean;
};

type MemberBookingReportResponse = {
  bookingMembers: BookingMemberRow[];
  nextSkip: number;
  nextPage: boolean;
};

// Safety cap against a runaway loop if the API ever gets stuck on nextPage=true.
const MAX_PAGES = 50;

// Waitlisted is dropped from v1 — no live-verified enum value for it was
// observed. "transferred" BookingStatus counts toward nothing, per spec.
function rollUpCounts(rows: BookingMemberRow[]) {
  let attended = 0;
  let noShow = 0;
  let lateCancelled = 0;
  let cancelled = 0;

  for (const row of rows) {
    if (row.AttendanceStatus === 'attended') attended++;
    else if (row.AttendanceStatus === 'not-attended') noShow++;

    if (row.IsLateCancelled === true) lateCancelled++;
    else if (row.BookingStatus === 'cancelled') cancelled++;
  }

  return { attended, noShow, lateCancelled, cancelled };
}

type AttendanceData = {
  totalAttendees: number;
  totalNonAttendee: number;
  totalCancellations: number;
  totalLateCancellation: number;
  trendPct: number;
  sparklineValues: number[];
};

const EMPTY_DATA: AttendanceData = {
  totalAttendees: 0,
  totalNonAttendee: 0,
  totalCancellations: 0,
  totalLateCancellation: 0,
  trendPct: 0,
  sparklineValues: [],
};

@Component({
  selector: 'app-attendance-fill-trends',
  imports: [UIChart, Tag, LucideAngularModule, ReportLink],
  templateUrl: './attendance-fill-trends.html',
})
export class AttendanceFillTrends {
  private readonly http = inject(HttpClient);
  readonly period = input.required<string>();

  protected readonly SPARKLINE_OPTIONS = SPARKLINE_OPTIONS;
  protected readonly TrendingUp = TrendingUp;
  protected readonly TrendingDown = TrendingDown;
  protected readonly formatPercent = formatPercent;

  protected readonly data = signal<AttendanceData>(EMPTY_DATA);
  protected readonly chartData = signal(sparklineData([0, 0], BRAND_CYAN, BRAND_PALE));
  protected readonly trendLabelText = signal('');

  constructor() {
    let requestId = 0;
    effect(() => {
      const period = this.period();
      const currentRequest = ++requestId;
      const { fromDate, toDate } = apiDateRangeForPeriod(period, new Date());

      this.load(fromDate, toDate).then((result) => {
        if (currentRequest !== requestId) return;
        this.data.set(result);
        this.chartData.set(sparklineData(result.sparklineValues, BRAND_CYAN, BRAND_PALE));
        this.trendLabelText.set(trendLabel(period));
      });
    });
  }

  private async fetchAllBookingRows(fromDate: string, toDate: string): Promise<BookingMemberRow[]> {
    const rows: BookingMemberRow[] = [];
    let skip = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const params = {
        locations: '',
        // TODO: Manager department-scoping goes here once we know how the
        // logged-in user's departments are supplied — for now this widget is
        // always the Admin/all-club view (blank = "All", per the API doc).
        department: '',
        classId: '',
        trainerId: '',
        status: '',
        fromDate,
        toDate,
        searchText: '',
        fetchFromDbOnly: 'false',
        skip: String(skip),
      };
      // fitnessCenterId is injected by the dev proxy from .env — see proxy.conf.js.
      const body = await firstValueFrom(
        this.http.get<MemberBookingReportResponse>('/api/reports/memberBookingReport', { params })
      );
      rows.push(...(body.bookingMembers ?? []));

      if (!body.nextPage) return rows;
      skip = body.nextSkip;
    }

    console.error(`[attendance-fill-trends] stopped after ${MAX_PAGES} pages — API may be stuck on nextPage=true`);
    return rows;
  }

  private async load(fromDate: string, toDate: string): Promise<AttendanceData> {
    try {
      const rows = await this.fetchAllBookingRows(fromDate, toDate);
      const counts = rollUpCounts(rows);
      return {
        totalAttendees: counts.attended,
        totalNonAttendee: counts.noShow,
        totalCancellations: counts.cancelled,
        totalLateCancellation: counts.lateCancelled,
        // TODO: a real trend needs a second call for the prior period — out
        // of scope for this pass (see docs/api/attendance-and-fill.md,
        // "Trend over time"), so this stays flat until that's wired.
        trendPct: 0,
        sparklineValues: [counts.attended, counts.attended],
      };
    } catch (err) {
      console.error('[attendance-fill-trends] failed to load member booking report', err);
      return EMPTY_DATA;
    }
  }

  // TODO: fill % requires attendanceReport (BookedSpots/TotalSpots) —
  // deferred follow-up. See docs/api/attendance-and-fill.md, "Fill %". No
  // fill element is rendered below yet, so nothing to flatten visually.

  protected isUp(): boolean {
    return this.data().trendPct >= 0;
  }
}
