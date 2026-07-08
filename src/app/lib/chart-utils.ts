import type { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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

// The React app's Recharts <LabelList position="right"> printed a persistent
// value label past the end of every bar (both Sales by department's $ bars
// and Instructor performance's % bars). Chart.js has no built-in equivalent
// — chartjs-plugin-datalabels reproduces it. Passed per-chart via p-chart's
// `[plugins]` input (see HORIZONTAL_BAR_PLUGINS below) rather than globally
// registered, so sparkline line charts elsewhere are unaffected.
export const HORIZONTAL_BAR_PLUGINS = [ChartDataLabels];

export function horizontalBarOptions(valueFormatter: (v: number) => string, max?: number): ChartOptions<'bar'> {
  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    // Mirrors Recharts' `margin={{ right: 36 }}` — reserves room so the
    // value label past each bar's end doesn't get clipped by the canvas edge.
    layout: {
      padding: { right: 36 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => valueFormatter(Number(ctx.raw)),
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        clip: false,
        color: '#1e2f51',
        font: { size: 12, weight: 500 },
        formatter: (value: number) => valueFormatter(value),
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
