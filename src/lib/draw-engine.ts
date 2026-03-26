export type DrawMode = "random" | "algorithmic";

export interface SimulationParticipant {
  userId: string;
  scores: number[];
}

export interface SimulationResult {
  winningNumbers: number[];
  winnerCounts: Record<3 | 4 | 5, number>;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function normalizeScores(scores: number[]) {
  return scores.filter((n) => Number.isInteger(n) && n >= 1 && n <= 45);
}

export function countMatches(playerScores: number[], winningNumbers: number[]) {
  const playerSet = new Set(normalizeScores(playerScores));
  return winningNumbers.filter((n) => playerSet.has(n)).length;
}

export function generateRandomWinningNumbers() {
  const selected = new Set<number>();
  while (selected.size < 5) {
    selected.add(randomInt(1, 45));
  }
  return Array.from(selected).sort((a, b) => a - b);
}

export function generateAlgorithmicWinningNumbers(allScores: number[]) {
  const normalized = normalizeScores(allScores);
  if (normalized.length === 0) {
    return generateRandomWinningNumbers();
  }

  const frequencies = new Map<number, number>();
  for (const score of normalized) {
    frequencies.set(score, (frequencies.get(score) || 0) + 1);
  }

  const ranked = Array.from(frequencies.entries()).sort((a, b) => b[1] - a[1]);
  const topPool = ranked.slice(0, 20).map(([score]) => score);
  const lowPool = [...ranked].reverse().slice(0, 20).map(([score]) => score);

  const picked = new Set<number>();
  let guard = 0;

  while (picked.size < 5 && guard < 500) {
    guard += 1;
    const useTopPool = Math.random() >= 0.5;
    const pool = useTopPool ? topPool : lowPool;
    if (pool.length === 0) break;
    const next = pool[randomInt(0, pool.length - 1)];
    picked.add(next);
  }

  while (picked.size < 5) {
    picked.add(randomInt(1, 45));
  }

  return Array.from(picked).sort((a, b) => a - b);
}

export function runDrawSimulation(mode: DrawMode, participants: SimulationParticipant[]): SimulationResult {
  const allScores = participants.flatMap((p) => p.scores);
  const winningNumbers = mode === "algorithmic"
    ? generateAlgorithmicWinningNumbers(allScores)
    : generateRandomWinningNumbers();

  const winnerCounts: Record<3 | 4 | 5, number> = { 3: 0, 4: 0, 5: 0 };

  for (const participant of participants) {
    const matches = countMatches(participant.scores, winningNumbers);
    if (matches === 3 || matches === 4 || matches === 5) {
      winnerCounts[matches] += 1;
    }
  }

  return { winningNumbers, winnerCounts };
}
