import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { LucideAngularModule } from 'lucide-angular';
import { CalendarRange } from '@/icons';

@Component({
  selector: 'app-period-control',
  imports: [FormsModule, Select, LucideAngularModule],
  templateUrl: './period-control.html',
})
export class PeriodControl {
  readonly options = input.required<string[]>();
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  protected readonly CalendarRange = CalendarRange;
}
