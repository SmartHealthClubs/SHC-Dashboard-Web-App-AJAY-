import { Component, input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { LucideAngularModule } from 'lucide-angular';
import { ArrowUpRight } from '@/icons';

@Component({
  selector: 'app-report-link',
  imports: [Tooltip, LucideAngularModule],
  templateUrl: './report-link.html',
})
export class ReportLink {
  readonly label = input.required<string>();
  protected readonly ArrowUpRight = ArrowUpRight;
}
