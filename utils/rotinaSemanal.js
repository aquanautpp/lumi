// utils/rotinaSemanal.js
const categoriasPorDia = {
  0: { categoria: 'família', dificuldade: 'fácil' },     // Domingo
  1: { categoria: 'português', dificuldade: 'médio' },    // Segunda
  2: { categoria: 'lógica', dificuldade: 'difícil' },     // Terça
  3: { categoria: 'matemática', dificuldade: 'fácil' },   // Quarta
  4: { categoria: 'memória', dificuldade: 'médio' },      // Quinta
  5: { categoria: 'desenho', dificuldade: 'criativo' },   // Sexta
  6: { categoria: 'mundo', dificuldade: 'explorador' }    // Sábado
};

/**
 * Retorna a categoria e dificuldade do desafio do dia com base no dia da semana.
 * @returns {{ categoria: string, dificuldade: string }}
 */
function obterDesafioDoDia() {
  const hoje = new Date().getDay(); // 0 (domingo) até 6 (sábado)
  return categoriasPorDia[hoje] || { categoria: 'matemática', dificuldade: 'fácil' };
}

export { obterDesafioDoDia };
