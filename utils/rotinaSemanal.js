// utils/rotinaSemanal.js
import { selecionarDesafioPorCategoriaEEstilo, escolherDesafioPorCategoria } from './desafios.js';

const categoriasValidas = ['matematica', 'logica', 'portugues', 'charada', 'visual'];

const diasDaSemana = [
  { dia: 0, categoria: 'charada', dificuldade: 'fácil' },     // Domingo
  { dia: 1, categoria: 'portugues', dificuldade: 'médio' },   // Segunda
  { dia: 2, categoria: 'logica', dificuldade: 'difícil' },    // Terça
  { dia: 3, categoria: 'matematica', dificuldade: 'fácil' },  // Quarta
  { dia: 4, categoria: 'visual', dificuldade: 'médio' },      // Quinta
  { dia: 5, categoria: 'logica', dificuldade: 'fácil' },      // Sexta
  { dia: 6, categoria: 'matematica', dificuldade: 'médio' }   // Sábado
];

/**
 * Retorna o desafio do dia com base no dia da semana e, opcionalmente, em um estilo.
 */
export function obterDesafioDoDia(dia = new Date().getDay(), estilo = null, numero = null) {
  const hoje = diasDaSemana.find(d => d.dia === dia);

  if (!hoje || !categoriasValidas.includes(hoje.categoria)) {
    return {
      categoria: 'matematica',
      dificuldade: 'fácil',
      ...escolherDesafioPorCategoria('matematica')
    };
  }

  let desafio = estilo
    ? selecionarDesafioPorCategoriaEEstilo(hoje.categoria, estilo, numero)
    : escolherDesafioPorCategoria(hoje.categoria, numero);

  if (!desafio) {
    desafio = escolherDesafioPorCategoria('matematica', numero);
  }

  return {
    categoria: hoje.categoria,
    dificuldade: hoje.dificuldade,
    ...desafio
  };
}
