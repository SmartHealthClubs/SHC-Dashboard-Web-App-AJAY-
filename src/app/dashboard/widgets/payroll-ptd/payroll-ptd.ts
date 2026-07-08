import { Component, computed, inject, input } from '@angular/core';
import { PAYROLL, PAYROLL_PERIOD_LABEL } from '@/mock/payroll';
import { LocationService } from '@/services/location.service';
import { currentCoachId, departmentIdsForScope } from '@/lib/widget-scope';
import { formatCurrency, sum } from '@/lib/format';
import { ReportLink } from '@/dashboard/report-link/report-link';
import type { ScopeLevel } from '@/lib/scope';

@Component({
  selector: 'app-payroll-ptd',
  imports: [ReportLink],
  templateUrl: './payroll-ptd.html',
})
export class PayrollPtd {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();

  protected readonly PAYROLL_PERIOD_LABEL = PAYROLL_PERIOD_LABEL;
  protected readonly formatCurrency = formatCurrency;

  protected readonly data = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    let rows = PAYROLL;

    if (scope === 'mine') {
      const coachId = currentCoachId(locationId);
      rows = PAYROLL.filter((r) => r.staffId === coachId);
    } else if (scope === 'my-departments') {
      const departmentIds = departmentIdsForScope(scope, locationId);
      rows = PAYROLL.filter(
        (r) =>
          r.locationId === locationId &&
          (departmentIds === 'all' || r.departmentIds.some((d) => departmentIds.includes(d)))
      );
    }

    return {
      staffCount: rows.length,
      totalPay: sum(rows.map((r) => r.totalPay)),
      classPay: sum(rows.map((r) => r.classPay)),
      programPay: sum(rows.map((r) => r.programPay)),
      privatePay: sum(rows.map((r) => r.privatePay)),
      semiPrivatePay: sum(rows.map((r) => r.semiPrivatePay)),
    };
  });
}
