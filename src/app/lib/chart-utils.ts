import type { ChartData, ChartOptions } from 'chart.js';

/** Minimal, axis-free sparkline — the Chart.js equivalent of the React app's Recharts <AreaChart>. */
export function sparklineData(
  values: number[],
  lineColor: string,
  fillColor: string
): ChartData<'line'> {
  return {
    labels: values.map((_, i) => String(i)),
    datasets: [
      {
        data: values,
        borderColor: lineColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };
}

export const SPARKLINE_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};

/** Ranked horizontal bar chart — the Chart.js equivalent of the React app's Recharts vertical-layout <BarChart>. */
export function horizontalBarData(
  labels: string[],
  values: number[],
  colors: string[]
): ChartData<'bar'> {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  };
}

export function horizontalBarOptions(valueFormatter: (v: number) => string, max?: number): ChartOptions<'bar'> {
  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => valueFormatter(Number(ctx.raw)),
        },
      },
    },
    scales: {
      x: { display: false, max },
      y: {
        grid: { display: false },
        ticks: { color: '#1e2f51', font: { size: 12 } },
      },
    },
  };
}
