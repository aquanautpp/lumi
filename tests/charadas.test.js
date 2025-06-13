import { desafios } from '../utils/desafios.js';

function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-zà-ü]/g, '');
  const vowels = cleaned.match(/[aeiouà-ü]+/g);
  return vowels ? vowels.length : 1;
}

function flesch(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const sentences = 1;
  return 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length);
}

describe('charadas', () => {
  test('todas possuem boa legibilidade', () => {
    desafios.charada.forEach(c => {
      expect(flesch(c.enunciado)).toBeGreaterThan(50);
    });
  });
});
