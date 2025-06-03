// utils/rotinaSemanal.js
import { selecionarDesafioPorCategoriaEEstilo, escolherDesafioPorCategoria } from './desafios.js';

const diasDaSemana = [
  { dia: 0, categoria: 'família', dificuldade: 'fácil' },     // Domingo
  { dia: 1, categoria: 'português', dificuldade: 'médio' },    // Segunda
  { dia: 2, categoria: 'lógica', dificuldade: 'difícil' },     // Terça
  { dia: 3, categoria: 'matemática', dificuldade: 'fácil' },   // Quarta
  { dia: 4, categoria: 'memória', dificuldade: 'médio' },      // Quinta
  { dia: 5, categoria: 'desenho', dificuldade: 'criativo' },   // Sexta
  { dia: 6, categoria: 'mundo', dificuldade: 'explorador' }    // Sábado
];

/**
 * Retorna o desafio do dia com base no dia da semana e, opcionalmente, em um estilo.
 * @param {number} [dia=new Date().getDay()] - O dia da semana (0 = domingo, 6 = sábado)
 * @param {string} [estilo=null] - O estilo opcional para o desafio
 * @returns {{ categoria: string, dificuldade: string, ...desafio }}
 */
export function obterDesafioDoDia(dia = new Date().getDay(), estilo = null) {
  const hoje = diasDaSemana.find(d => d.dia === dia);
  if (!hoje) {
    // Fallback para um desafio padrão, como no código original
    return {
      categoria: 'matemática',
      dificuldade: 'fácil',
      ...escolherDesafioPorCategoria('matemática')
    };
  }

  let desafio;
  if (estilo) {
    // Tenta selecionar um desafio com categoria e estilo
    desafio = selecionarDesafioPorCategoriaEEstilo(hoje.categoria, estilo);
  } else {
    // Seleciona um desafio da categoria sem estilo específico
    desafio = escolherDesafioPorCategoria(hoje.categoria);
  }

  // Fallback se nenhum desafio for encontrado
  if (!desafio) {
    desafio = escolherDesafioPorCategoria(hoje.categoria);
  }

  return {
    categoria: hoje.categoria,
    dificuldade: hoje.dificuldade,
    ...desafio
  };
}
