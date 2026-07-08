export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}
