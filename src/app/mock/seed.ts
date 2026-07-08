// Deterministic pseudo-random helpers so the mock data looks the same on every
// reload instead of reshuffling — makes the demo predictable to review.
function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRng(seed: number) {
  const random = mulberry32(seed)
  return {
    next: () => random(),
    int: (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min,
    float: (min: number, max: number, decimals = 2) => {
      const value = random() * (max - min) + min
      const factor = 10 ** decimals
      return Math.round(value * factor) / factor
    },
    pick: <T,>(items: readonly T[]): T => items[Math.floor(random() * items.length)],
    bool: (probability = 0.5) => random() < probability,
  }
}
