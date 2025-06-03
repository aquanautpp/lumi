import { validarResposta } from '../utils/validacao.js';

describe('validarResposta', () => {
  test('numeric comparison', () => {
    expect(validarResposta('42', '42')).toBe(true);
    expect(validarResposta('42', '  42  ')).toBe(true);
    expect(validarResposta('41', '42')).toBe(false);
  });

  test('synonym matching', () => {
    const sinonimos = ['feliz', 'contente'];
    expect(validarResposta('Feliz', 'alegre', sinonimos)).toBe(true);
    expect(validarResposta('triste', 'alegre', sinonimos)).toBe(false);
  });

  test('numeric words', () => {
    expect(validarResposta('zero', '0')).toBe(true);
    expect(validarResposta('sete', '7')).toBe(true);
  });
});
