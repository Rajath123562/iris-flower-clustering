/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 * Ensures 100% deterministic reproducibility when the user inputs a seed.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number = 42) {
    // 32-bit unsigned integer initialization
    this.state = seed >>> 0;
  }

  /**
   * Generates a float in [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates an integer in [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
