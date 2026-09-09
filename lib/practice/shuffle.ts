/**
 * Deterministic pseudo-random generator (mulberry32-style) seeded from a string.
 * Used so quiz answer options are shuffled deterministically: the correct answer
 * is not always first, while server and client renders stay identical.
 */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle of options; returns the new correct-answer index. */
export function shuffleOptions(options: string[], seed: string): { options: string[]; correctAnswer: number } {
  const correct = options[0];
  const rand = seededRandom(seed);
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { options: arr, correctAnswer: arr.indexOf(correct) };
}
