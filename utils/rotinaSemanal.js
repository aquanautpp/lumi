// utils/rotinaSemanal.js
import { escolherDesafioPorCategoria } from './desafios.js';

const categoriasValidas = ['matematica', 'logica', 'portugues', 'ciencias', 'historia', 'charada', 'visual'];

let temaDaSemana = null;
let indiceRotacao = 0;
const ordemRotacao = ['matematica', 'portugues', 'ciencias', 'historia', 'logica'];

const diasDaSemana = [
  { dia: 0, categoria: 'charada', dificuldade: 'fácil' },     // Domingo
  { dia: 1, categoria: 'portugues', dificuldade: 'médio' },   // Segunda
  { dia: 2, categoria: 'ciencias', dificuldade: 'médio' },    // Terça
  { dia: 3, categoria: 'matematica', dificuldade: 'fácil' },  // Quarta
  { dia: 4, categoria: 'historia', dificuldade: 'médio' },    // Quinta
  { dia: 5, categoria: 'logica', dificuldade: 'fácil' },      // Sexta
  { dia: 6, categoria: 'visual', dificuldade: 'médio' }       // Sábado
];

/**
 * Retorna o desafio do dia com base no dia da semana e, opcionalmente, em um estilo.
 */
export function definirTemaDaSemana(categoria) {
  if (categoriasValidas.includes(categoria)) {
    temaDaSemana = categoria;
  }
}

export function rotacionarTemaDaSemana() {
  temaDaSemana = ordemRotacao[indiceRotacao % ordemRotacao.length];
  indiceRotacao += 1;
}

export function obterDesafioDoDia(dia = new Date().getDay(), estilo = null, numero = null) {
  const base = temaDaSemana
    ? { categoria: temaDaSemana, dificuldade: 'médio' }
    : diasDaSemana.find(d => d.dia === dia);

  if (!base || !categoriasValidas.includes(base.categoria)) {
    return {
      categoria: 'matematica',
      dificuldade: 'fácil',
      ...escolherDesafioPorCategoria('matematica')
    };
  }

  let desafio = escolherDesafioPorCategoria(base.categoria, numero, estilo);

  if (!desafio) {
    desafio = escolherDesafioPorCategoria('matematica', numero);
  }

  return {
    categoria: base.categoria,
    dificuldade: base.dificuldade,
    ...desafio
  };
}
