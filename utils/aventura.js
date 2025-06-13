import { desafios, selecionarDesafioPorCategoriaEEstilo } from './desafios.js';
import { memoriaUsuarios, desafiosPendentes, salvarMemoria } from './memoria.js';

const etapas = [
  {
    texto: 'Você entrou na Caverna Sombria. Para acender a tocha, resolva:',
    desafio: { categoria: 'matematica', tipo: 'narrativo' },
    conclusao: 'A caverna se ilumina e revela uma passagem secreta.'
  },
  {
    texto: 'Na ponte quebradiça há um enigma. Para atravessar, responda:',
    desafio: { categoria: 'logica', tipo: 'auditivo' },
    conclusao: 'A ponte se estabiliza e você continua o caminho.'
  },
  {
    texto: 'Um guardião da floresta quer testar seus conhecimentos:',
    desafio: { categoria: 'ciencias', tipo: 'narrativo' },
    conclusao: 'O guardião permite sua passagem.'
  },
  {
    texto: 'A porta do tesouro pede uma última senha:',
    desafio: { categoria: 'portugues', tipo: 'narrativo' },
    conclusao: 'Parabéns! Você concluiu a aventura e encontrou o tesouro!'
  }
];

export function iniciarAventura(numero) {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = {};
  }
  memoriaUsuarios[numero].aventura = {
    step: 0,
    history: []
  };
  salvarMemoria();
}

export function proximaEtapa(numero) {
  const usuario = memoriaUsuarios[numero];
  if (usuario && usuario.aventura && usuario.aventura.step < etapas.length - 1) {
    usuario.aventura.step += 1;
    salvarMemoria();
  }
}

export function getEtapaAtual(numero) {
  const usuario = memoriaUsuarios[numero];
  if (usuario && usuario.aventura) {
    return etapas[usuario.aventura.step];
  }
  return null;
}

export function enviarDesafioAventura(numero) {
  const etapa = getEtapaAtual(numero);
  if (etapa) {
    const desafio = selecionarDesafioPorCategoriaEEstilo(
      etapa.desafio.categoria,
      etapa.desafio.tipo,
      numero
    );
    if (desafio) {
      desafiosPendentes[numero] = {
        ...desafio,
        categoria: etapa.desafio.categoria,
        tentativas: 0,
        aventura: true
      };
      salvarMemoria();
      return `🌟 *${etapa.texto}*\n\n🧠 ${desafio.enunciado}`;
    }
  }
  return null;
}

export function concluirEtapa(numero, acertou) {
  const usuario = memoriaUsuarios[numero];
  if (!usuario?.aventura) return null;
  const etapa = etapas[usuario.aventura.step];
  usuario.aventura.history.push({ step: usuario.aventura.step + 1, acertou });
  const msg = etapa.conclusao;
  if (usuario.aventura.step >= etapas.length - 1) {
    delete usuario.aventura;
    salvarMemoria();
    return msg;
  }
  usuario.aventura.step += 1;
  salvarMemoria();
  return msg;
}
