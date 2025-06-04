import { desafios, selecionarDesafioPorCategoriaEEstilo } from './desafios.js';
import { memoriaUsuarios, desafiosPendentes, salvarMemoria } from './memoria.js';

const etapas = [
  {
    introducao: "Bem-vindo ao Reino dos Números! O rei precisa de ajuda para resolver problemas matemáticos.",
    desafio: { categoria: "matematica", tipo: "visual" },
    conclusao: "Parabéns! Você ajudou o rei e salvou o reino!"
  },
  {
    introducao: "Agora, vamos à Floresta da Lógica, onde enigmas esperam por você.",
    desafio: { categoria: "logica", tipo: "auditivo" },
    conclusao: "Você desvendou os mistérios da floresta!"
  }
  // Adicione mais etapas conforme necessário
];

export function iniciarAventura(numero) {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = {};
  }
  memoriaUsuarios[numero].aventura = {
    etapaAtual: 0,
    concluidas: []
  };
  salvarMemoria();
}

export function proximaEtapa(numero) {
  const usuario = memoriaUsuarios[numero];
  if (usuario && usuario.aventura && usuario.aventura.etapaAtual < etapas.length - 1) {
    usuario.aventura.etapaAtual += 1;
    salvarMemoria();
  }
}

export function getEtapaAtual(numero) {
  const usuario = memoriaUsuarios[numero];
  if (usuario && usuario.aventura) {
    return etapas[usuario.aventura.etapaAtual];
  }
  return null;
}

export function enviarDesafioAventura(numero) {
  const etapa = getEtapaAtual(numero);
  if (etapa) {
    const desafio = selecionarDesafioPorCategoriaEEstilo(etapa.desafio.categoria, etapa.desafio.tipo, numero);
    if (desafio) {
      desafiosPendentes[numero] = desafio;
      salvarMemoria();
      return `🌟 *${etapa.introducao}*\n\n🧠 ${desafio.enunciado}`;
    }
  }
  return null;
}
