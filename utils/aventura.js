import { desafios, selecionarDesafioPorCategoriaEEstilo } from './desafios.js';
import { memoriaUsuarios, desafiosPendentes, salvarMemoria } from './memoria.js';

const etapas = [
  {
    texto: `🏞️ *Capítulo 1 – O Chamado da Montanha*\nVocê encontrou um mapa antigo embaixo da sua cama... Ele fala de um tesouro perdido na Caverna dos Desafios. Ao chegar à entrada da caverna, uma tocha apagada bloqueia a passagem. Para acendê-la, resolva:`,
    desafio: { categoria: 'matematica', tipo: 'narrativo' },
    conclusao: '🔥 A tocha se acende magicamente, revelando uma escadaria em espiral que desce para as profundezas...'
  },
  {
    texto: `🌉 *Capítulo 2 – A Ponte das Sombras*\nVocê encontra uma ponte feita de cordas velhas e tábuas podres. Um eco misterioso sussurra um enigma no seu ouvido. Para atravessar com segurança, descubra a resposta:`,
    desafio: { categoria: 'logica', tipo: 'auditivo' },
    conclusao: '🌫️ Ao resolver o enigma, a névoa se dissipa e a ponte se torna firme como pedra.'
  },
  {
    texto: `🌳 *Capítulo 3 – O Guardião da Floresta Encantada*\nUma criatura sábia, metade coruja, metade onça, surge entre as árvores. Ela diz: "Só os que dominam os mistérios da natureza podem passar por mim." Prove seu valor!`,
    desafio: { categoria: 'ciencias', tipo: 'narrativo' },
    conclusao: '🦉 A criatura sorri e desaparece em uma nuvem de folhas. Um novo caminho se abre diante de você.'
  },
  {
    texto: `🏰 *Capítulo 4 – A Porta dos Mil Segredos*\nFinalmente, você chega à sala do tesouro. Mas uma porta de pedra mágica exige a palavra final. A dica está em um antigo pergaminho...`,
    desafio: { categoria: 'portugues', tipo: 'narrativo' },
    conclusao: '🏆 A porta se abre lentamente... e você encontra o tesouro perdido! Uma coroa feita de estrelas e livros encantados!'
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
