const WORDS = [
  'CLOUDS',
  'LINODE',
  'SERVER',
  'DOCKER',
  'PYTHON',
  'BUN-JS',
  'NEXTJS',
  'REACT-',
  'BINARY',
  'SYSTEM',
  'KUBER-',
  'AKAMAI',
  'NODES-',
  'DEPLOY',
  'CONFIG',
  'SCRIPT',
  'ENGINE',
  'MEMORY',
  'PUZZLE',
  'MATRIX',
  'SOURCE',
  'TARGET',
  'OFFSET',
  'STREAM',
];

export type GuessResult = 'correct' | 'present' | 'absent';

export function getRandomWord(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  return word.toUpperCase();
}

export function checkGuess(guess: string, secret: string): GuessResult[] {
  const result: GuessResult[] = new Array(6).fill('absent');
  const secretArr = secret.split('');
  const guessArr = guess.toUpperCase().split('');

  // First pass: find correct positions
  for (let i = 0; i < 6; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i] = 'correct';
      secretArr[i] = '#'; // Mark as used
    }
  }

  // Second pass: find present but wrong positions
  for (let i = 0; i < 6; i++) {
    if (result[i] !== 'correct') {
      const index = secretArr.indexOf(guessArr[i]);
      if (index !== -1) {
        result[i] = 'present';
        secretArr[index] = '#'; // Mark as used
      }
    }
  }

  return result;
}
