export type GamePattern = {
  name: string;
  sequence: number[];
  secretRule: string;
  solution: number[];
};

const PATTERNS = [
  {
    name: 'Linear Echo',
    generate: () => {
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 2;
      return {
        sequence: [start, start + step, start + step * 2],
        solution: [start + step * 3, start + step * 4],
        secretRule: `Add ${step} each time`,
      };
    },
  },
  {
    name: 'Binary Pulse',
    generate: () => {
      const start = Math.pow(2, Math.floor(Math.random() * 3) + 1);
      return {
        sequence: [start, start * 2, start * 4],
        solution: [start * 8, start * 16],
        secretRule: 'Double the previous number',
      };
    },
  },
  {
    name: 'Square Wave',
    generate: () => {
      const start = Math.floor(Math.random() * 4) + 1;
      return {
        sequence: [
          start * start,
          (start + 1) * (start + 1),
          (start + 2) * (start + 2),
        ],
        solution: [(start + 3) * (start + 3), (start + 4) * (start + 4)],
        secretRule: 'Consecutive squares',
      };
    },
  },
  {
    name: 'Prime Jump',
    generate: () => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
      const startIdx = Math.floor(Math.random() * (primes.length - 5));
      return {
        sequence: [
          primes[startIdx],
          primes[startIdx + 1],
          primes[startIdx + 2],
        ],
        solution: [primes[startIdx + 3], primes[startIdx + 4]],
        secretRule: 'Next prime number',
      };
    },
  },
];

export function generateGame(): GamePattern {
  const patternType = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  return {
    name: patternType.name,
    ...patternType.generate(),
  };
}
