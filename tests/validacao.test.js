import { validarResposta, validarTentativas } from '../utils/validacao.js';

describe('validarResposta', () => {
  test('numeric comparison', () => {
    expect(validarResposta('42', '42')).toBe(true);
    expect(validarResposta('42', '  42  ')).toBe(true);
    expect(validarResposta('41', '42')).toBe(false);
  });

  test('numeric words normalization', () => {
    expect(validarResposta('dois', '2')).toBe(true);
    expect(validarResposta('Três', '3')).toBe(true);
  });

  test('synonym matching', () => {
    const sinonimos = ['feliz', 'contente'];
    expect(validarResposta('Feliz', 'alegre', sinonimos)).toBe(true);
    expect(validarResposta('triste', 'alegre', sinonimos)).toBe(false);
  });

  test('accent and punctuation handling', () => {
    expect(validarResposta('São Paulo!', 'sao paulo')).toBe(true);
    expect(validarResposta('banana?', 'banana')).toBe(true);
  });
});

describe('validarTentativas', () => {
  test('acerto retorna verdadeiro', () => {
    const desafio = { resposta: '42', tentativas: 0 };
    const r = validarTentativas('42', desafio);
    expect(r.acertou).toBe(true);
  });

  test('primeira tentativa incorreta fornece dica', () => {
    const desafio = { resposta: '42', tentativas: 0 };
    const r = validarTentativas('41', desafio);
    expect(r.acertou).toBe(false);
    expect(r.dica).toBeDefined();
    expect(desafio.tentativas).toBe(1);
  });

  test('apos tres erros envia explicacao', () => {
    const desafio = { resposta: '42', tentativas: 2 };
    const r = validarTentativas('41', desafio);
    expect(r.acertou).toBe(false);
    expect(r.explicacao).toContain('42');
  });
});
