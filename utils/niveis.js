const niveis = [
  { nivel: 1, minAcertos: 0, recompensa: '🌱 Iniciante' },
  { nivel: 2, minAcertos: 3, recompensa: '🌟 Explorador' },
  { nivel: 3, minAcertos: 6, recompensa: '🚀 Desbravador' },
  { nivel: 4, minAcertos: 10, recompensa: '🏆 Mestre' },
  { nivel: 5, minAcertos: 14, recompensa: '🎓 Sábio' },
  { nivel: 6, minAcertos: 18, recompensa: '🥇 Legendário' }
];

function obterNivel(acertos) {
return (
    niveis
      .slice()
      .reverse()
      .find(n => acertos >= n.minAcertos) || niveis[0]
  );
}

function verificarNivel(usuario) {
  const acertos = usuario.historico?.filter(h => h.acertou).length || 0;
  const nivelAtual = obterNivel(acertos);
  usuario.nivelAtual = nivelAtual.nivel;
  if (usuario.nivelAnterior !== nivelAtual.nivel) {
    usuario.nivelAnterior = nivelAtual.nivel;
    return `🎉 Parabéns! Você subiu para o nível ${nivelAtual.nivel}: ${nivelAtual.recompensa}!`;
  }
  return null;
}

function definirNivel(estrelas) {
  if (estrelas < 3) return '🌱 Iniciante';
  if (estrelas < 6) return '🌟 Explorador';
  if (estrelas < 10) return '🚀 Desbravador';
  if (estrelas < 14) return '🏆 Mestre';
  if (estrelas < 18) return '🎓 Sábio';
  return '🥇 Legendário';
}

export { verificarNivel, definirNivel, obterNivel };
// feat: adiciona sistema de níveis e recompensas
