import { obterNivel, verificarNivel } from '../utils/niveis.js';

describe('niveis', () => {
  test('obterNivel retorna nivel correto', () => {
    expect(obterNivel(0).nivel).toBe(1);
    expect(obterNivel(7).nivel).toBe(2);
    expect(obterNivel(12).nivel).toBe(3);
    expect(obterNivel(25).nivel).toBe(4);
    expect(obterNivel(32).nivel).toBe(5);
    expect(obterNivel(52).nivel).toBe(6);
  });

  test('verificarNivel indica troca de nivel', () => {
    const usuario = { historico: [] };
    usuario.historico = Array(5).fill({ acertou: true });
    const msg = verificarNivel(usuario);
    expect(msg).toContain('nível 2');
    const semMsg = verificarNivel(usuario);
    expect(semMsg).toBeNull();
  });
});
