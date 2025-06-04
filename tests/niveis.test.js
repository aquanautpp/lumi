import { obterNivel, verificarNivel, definirNivel } from '../utils/niveis.js';

describe('niveis', () => {
  test('obterNivel retorna nivel correto', () => {
    expect(obterNivel(0).nivel).toBe(1);
    expect(obterNivel(3).nivel).toBe(2);
    expect(obterNivel(6).nivel).toBe(3);
    expect(obterNivel(10).nivel).toBe(4);
    expect(obterNivel(14).nivel).toBe(5);
    expect(obterNivel(18).nivel).toBe(6);
  });

  test('verificarNivel indica troca de nivel', () => {
    const usuario = { historico: [] };
    usuario.historico = Array(5).fill({ acertou: true });
    const msg = verificarNivel(usuario);
    expect(msg).toContain('nível 2');
    const semMsg = verificarNivel(usuario);
    expect(semMsg).toBeNull();
  });

  test('definirNivel retorna nome correto', () => {
    expect(definirNivel(0)).toBe('🌱 Iniciante');
    expect(definirNivel(3)).toBe('🌟 Explorador');
    expect(definirNivel(6)).toBe('🚀 Desbravador');
    expect(definirNivel(10)).toBe('🏆 Mestre');
    expect(definirNivel(14)).toBe('🎓 Sábio');
    expect(definirNivel(18)).toBe('🥇 Legendário');
  });
});
