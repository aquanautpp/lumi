import express from 'express';
import nlp from 'compromise';

import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from '../../utils/whatsapp.js';
import { escolherDesafioPorCategoria, gerarMissao, enviarCharadaVisual, registrarDesafioResolvido, selecionarDesafioPorCategoriaEEstilo, formatarPergunta } from '../../utils/desafios.js';
import {
  memoriaUsuarios,
  desafiosPendentes,
  missoesPendentes,
  salvarMemoria,
  definirNome,
  definirMascote
} from '../../utils/memoria.js';
import { gerarFeedback } from '../../utils/feedback.js';
import { atualizarMemoria } from '../../utils/historico.js';
import { verificarNivel, obterNivel } from '../../utils/niveis.js';
import { validarResposta, validarTentativas } from '../../utils/validacao.js';
import { obterDesafioDoDia } from '../../utils/rotinaSemanal.js';
import { getFala } from '../../utils/mascote.js';
import { aplicarPerguntaEstilo, processarRespostaEstilo } from '../../utils/learningStyle.js';
import { gerarRespostaIA } from '../../utils/ia.js';
import { enviarDesafioFamilia } from '../../utils/desafioFamilia.js';
import { enviarDesafioVidaReal } from '../../utils/desafiosVidaReal.js';
import { iniciarAventura, enviarDesafioAventura } from '../../utils/aventura.js';
import { explainCurrent } from '../../utils/challenges.js';

export default function webhookRouter({
  extrairTexto,
  normalizarTexto,
  enviarMensagemFinalDeTeste,
  comandosRapidos,
  OPCOES_FINAIS,
  comandosDetalhados,
  enviarListaComandos,
  enviarBoasVindas,
  LIMITE_INTERACOES
}) {
  const router = express.Router();
  function escapeXml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }


router.post('/webhook', async (req, res) => {
  global.__twiMLMessages = [];

  const sendTwiml = () => {
    const msgs = global.__twiMLMessages.map(m => {
      const body = escapeXml(m.body || '');
      return m.media
        ? `<Message><Body>${body}</Body><Media>${m.media}</Media></Message>`
        : `<Message>${body}</Message>`;
    }).join('');
    res.set('Content-Type', 'text/xml');
    return res.status(200).send(`<Response>${msgs}</Response>`);
  };

  const originalSendStatus = res.sendStatus.bind(res);
  res.sendStatus = code => {
    if (code === 200) return sendTwiml();
    return originalSendStatus(code);
  };

  let message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message && req.body.From && req.body.Body) {
    message = {
      from: req.body.From.replace(/^whatsapp:/, ''),
      text: { body: req.body.Body }
    };
  }

  if (!message) return res.sendStatus(200);

  const from = message.from;
  global.lastUserNumber = from;
  await salvarMemoria();
  let texto = extrairTexto(message);
  let textoLower = texto.toLowerCase();
  let textoSemAcento = normalizarTexto(texto);

  // Primeira interação: perguntar o nome que o usuário quer usar
  if (!memoriaUsuarios[from]) {
    memoriaUsuarios[from] = {
      interacoes: 1,
      historico: [],
      etapaCadastro: 'nome'
    };
    await salvarMemoria();
    await enviarMensagemWhatsApp(from, 'Eaí! Como você quer que eu te chame?');
    return res.sendStatus(200);
  }

  const usuario = memoriaUsuarios[from];
  if (usuario.bloqueado) {
    return res.sendStatus(200);
  }
  if (usuario.menuAtual && /^[1-3]$/.test(texto)) {
    const opcao = usuario.menuAtual[parseInt(texto) - 1];
    if (opcao) {
      texto = opcao.body;
      textoLower = texto.toLowerCase();
      textoSemAcento = normalizarTexto(texto);
    }
  }
  
  if (usuario.aguardandoRespostaFinal) {
    usuario.aguardandoRespostaFinal = false;
    usuario.respostaFinal = texto;
    if (textoSemAcento.includes('sim')) {
      await enviarMensagemWhatsApp(from, 'Oba! Aqui está o menu principal:', comandosRapidos);
    } else {
      usuario.bloqueado = true;
      await enviarMensagemWhatsApp(from, 'Tudo bem! Estarei por aqui quando quiser voltar 💜');
    }
    await salvarMemoria();
    return res.sendStatus(200);
  }
  usuario.historico = usuario.historico || [];

  if (usuario.etapaCadastro === 'nome') {
    await definirNome(from, texto);
    usuario.etapaCadastro = 'mascote';
    await salvarMemoria();
    await enviarMensagemWhatsApp(from, `Muito prazer, ${texto}! Qual mascote você quer? 🦊 Fofuxa ou 🐻 Bolotinha?`);
    return res.sendStatus(200);
  }

  if (usuario.etapaCadastro === 'mascote') {
    let mascote = null;
    if (textoSemAcento.includes('fofuxa')) mascote = 'Fofuxa';
    if (textoSemAcento.includes('bolotinha')) mascote = 'Bolotinha';
      if (mascote) {
        await definirMascote(from, mascote);
        usuario.etapaCadastro = null;
        await salvarMemoria();
      await enviarMensagemWhatsApp(from, `${mascote} está animada para te ver brilhar, ${usuario.nome}!`);
      await enviarBoasVindas(from);
    } else {
      await enviarMensagemWhatsApp(from, 'Escolha entre Fofuxa ou Bolotinha 😉');
    }
    return res.sendStatus(200);
  }

  const respondeuEstilo = await processarRespostaEstilo(from, texto);
  if (respondeuEstilo) return res.sendStatus(200);

  usuario.interacoes = (usuario.interacoes || 0) + 1;
  if (usuario.interacoes >= LIMITE_INTERACOES) {
    usuario.aguardandoRespostaFinal = true;
    await salvarMemoria();
    await enviarMensagemFinalDeTeste(from);
    return res.sendStatus(200);
  }
  await salvarMemoria();

if (["menu", "ajuda", "lista de comandos"].some(t => textoLower.includes(t))) {
    await enviarListaComandos(from);
    return res.sendStatus(200);
  }

  if (textoLower.includes('quem e voce') || textoLower.includes('quem é você')) {
    await enviarMensagemWhatsApp(from, 'Sou a Lumi, sua parceira de estudos! 💛');
    return res.sendStatus(200);
  }
  if (textoLower.includes('meu estilo') || textoLower.includes('estilo de aprendizagem')) {
    await aplicarPerguntaEstilo(from);
    return res.sendStatus(200);
   }

    if (textoLower.startsWith('/nome')) {
    const novo = texto.replace('/nome', '').trim();
    if (novo) {
      await definirNome(from, novo);
      await salvarMemoria();
      await enviarMensagemWhatsApp(from, `Tudo bem! Vou te chamar de ${novo}.`);
    } else {
      await enviarMensagemWhatsApp(from, 'Como você quer ser chamado?');
    }
    return res.sendStatus(200);
  }

  if (textoLower.includes('trocar nome')) {
    usuario.etapaCadastro = 'nome';
    await salvarMemoria();
    await enviarMensagemWhatsApp(from, 'Sem problemas! Como você quer ser chamado?');
    return res.sendStatus(200);
  } 
 
  if (["parar", "cancelar", "sair"].includes(textoLower)) {
    delete missoesPendentes[from];
    delete desafiosPendentes[from];
    await enviarMensagemWhatsApp(from, 'Tudo bem, a gente pode continuar depois! 💛');
    return res.sendStatus(200);
  }

  if (['qual era a resposta', 'me explica', 'qual a explicacao', 'qual a explicação'].some(t => textoLower.includes(t))) {
    const desafio = desafiosPendentes[from];
    const msg = explainCurrent(desafio);
    await enviarMensagemWhatsApp(from, msg);
    return res.sendStatus(200);
  }
  
  if (textoLower.includes('qual meu nivel') || textoLower.includes('qual meu nível')) {
    const acertos = usuario.historico?.filter(h => h.acertou).length || 0;
    const infoNivel = obterNivel(acertos);
    usuario.nivelAtual = infoNivel.nivel;
    await salvarMemoria();
    await enviarMensagemWhatsApp(from, `Seu nível atual é ${infoNivel.nivel}: ${infoNivel.recompensa}`);
    return res.sendStatus(200);
  }
 
  if (textoLower.includes('missao') || textoLower.includes('missão')) {
        delete desafiosPendentes[from];
    if (!missoesPendentes[from]) {
      const estilo = usuario.learningStyle || null;
      const missao = gerarMissao(estilo, from);
      if (missao) {
        missoesPendentes[from] = { desafios: missao, atual: 0 };
        await salvarMemoria();
        const primeiro = missao[0];
        desafiosPendentes[from] = { ...primeiro, categoria: primeiro.categoria, tentativas: 0 };
        await salvarMemoria();
        await enviarMensagemWhatsApp(from, `📘 Missão do Dia! Categoria: ${primeiro.categoria}

🧠 ${primeiro.enunciado}`);
        if (primeiro.midia) await enviarMidiaWhatsApp(from, primeiro.midia, primeiro.tipo);
      } else {
        await enviarMensagemWhatsApp(from, 'Não consegui criar a missão agora. Tente mais tarde!');
      }
    } else {
      await enviarMensagemWhatsApp(from, 'Você já tem uma missão em andamento! Responda o desafio anterior.');
    }
    return res.sendStatus(200);
  }

  const doc = nlp(textoLower);
  const querDesafio = doc.has('novo desafio') || doc.has('outro desafio') || /(quero.*desafio|mais.*desafio)/.test(textoSemAcento);
  if (querDesafio) {
    delete desafiosPendentes[from];
    const estilo = usuario.learningStyle || null;
    const hoje = obterDesafioDoDia(undefined, null, from);
    const desafio = escolherDesafioPorCategoria(hoje.categoria, from, estilo);
    if (!desafio) {
      await enviarMensagemWhatsApp(from, `📅 Hoje é dia de *${hoje.categoria}*, mas não encontrei um desafio agora. Me peça um desafio com outra categoria!`);
      return res.sendStatus(200);
    }
    desafiosPendentes[from] = { ...desafio, categoria: hoje.categoria, tentativas: 0 };
    await salvarMemoria();
    await enviarMensagemWhatsApp(from, `📅 Hoje é dia de *${hoje.categoria}*!\n\n🧠 ${desafio.enunciado}`);
    if (desafio.midia) await enviarMidiaWhatsApp(from, desafio.midia, desafio.tipo);
    return res.sendStatus(200);
  }

 if (textoLower.includes('desafio em familia') || textoLower.includes('desafio em família')) {
       delete desafiosPendentes[from];
    await enviarDesafioFamilia(from);
    return res.sendStatus(200);
  }

  if (textoLower.includes('desafio da vida real')) {
        delete desafiosPendentes[from];
    await enviarDesafioVidaReal(from);
    return res.sendStatus(200);
  }

  if (textoLower.includes('aventura')) {
        delete desafiosPendentes[from];
    if (!memoriaUsuarios[from]?.aventura) iniciarAventura(from);
    const msg = enviarDesafioAventura(from);
    if (msg) {
      await enviarMensagemWhatsApp(from, msg);
    } else {
      await enviarMensagemWhatsApp(from, 'Não há mais etapas de aventura disponíveis.');
    }
    return res.sendStatus(200);
  }

    if (textoLower.includes("charada")) {
          delete desafiosPendentes[from];
    const estilo = usuario.learningStyle || null;
    const desafio = estilo ? selecionarDesafioPorCategoriaEEstilo("charada", estilo, from) : escolherDesafioPorCategoria("charada", from);
    if (desafio) {
      desafiosPendentes[from] = { ...desafio, categoria: "charada", tentativas: 0 };
      await salvarMemoria();
         await enviarMensagemWhatsApp(from, `🧩 Charada:\n\n${desafio.enunciado}`);
    } else {
    await enviarMensagemWhatsApp(from, "Não encontrei uma charada agora. Tente mais tarde!");
    }
    return res.sendStatus(200);
  }

  // Processa resposta do desafio pendente
  if (desafiosPendentes[from]) {
    const desafio = desafiosPendentes[from];

    if (textoLower.includes('qual a explicacao') || textoLower.includes('qual a explicação')) {
      const msg = desafio.explicacao || `A resposta correta é ${desafio.resposta}.`;
      await enviarMensagemWhatsApp(from, msg);
      delete desafiosPendentes[from];
      await salvarMemoria();
      return res.sendStatus(200);
    }

    const resultado = validarTentativas(texto, desafio);
    await atualizarMemoria(from, desafio.categoria, resultado.acertou, texto, desafio.resposta, desafio.enunciado);

    const estilo = usuario.learningStyle || null;
    if (resultado.acertou) {
      registrarDesafioResolvido(from, desafio);
      const fb = gerarFeedback(true, estilo, desafio);
      const feedback = fb ? `${fb} ${getFala('acerto')}` : null;
      if (feedback) await enviarMensagemWhatsApp(from, feedback);
        if (['portugues','ciencias','historia'].includes(desafio.categoria)) {
        await enviarMensagemWhatsApp(from, getFala(desafio.categoria));
      }
      const msgNivel = verificarNivel(usuario);
      if (msgNivel) await enviarMensagemWhatsApp(from, msgNivel);
      delete desafiosPendentes[from];
      if (missoesPendentes[from]) {
        const missao = missoesPendentes[from];
        missao.atual += 1;
        if (missao.atual < missao.desafios.length) {
          const prox = missao.desafios[missao.atual];
          desafiosPendentes[from] = { ...prox, categoria: prox.categoria, tentativas: 0 };
          await salvarMemoria();
          await enviarMensagemWhatsApp(from, `🧩 Próximo desafio! Categoria: ${prox.categoria}\n\n🧠 ${prox.enunciado}`);
          if (prox.midia) await enviarMidiaWhatsApp(from, prox.midia, prox.tipo);
          return res.sendStatus(200);
        } else {
          delete missoesPendentes[from];
          await salvarMemoria();
          await enviarMensagemWhatsApp(from, 'Parabéns! Você concluiu a missão do dia! 🎉');
          await enviarMensagemWhatsApp(from, 'O que você deseja fazer agora?', comandosRapidos);
          return res.sendStatus(200);
        }
      }
      await enviarMensagemWhatsApp(from, 'O que você deseja fazer agora?', comandosRapidos);
    } else if (resultado.dica) {
      await enviarMensagemWhatsApp(from, resultado.dica);
    } else if (resultado.explicacao) {
      await enviarMensagemWhatsApp(
        from,
        'Resposta incorreta! Se quiser entender melhor, digite "qual a explicacao".'
      );
    } else {
      const fbErr = gerarFeedback(false, estilo, desafio);
      if (fbErr) await enviarMensagemWhatsApp(from, fbErr);
    }
    await salvarMemoria();
    return res.sendStatus(200);
  }

  const respostaIA = await gerarRespostaIA(texto);
  await enviarMensagemWhatsApp(from, respostaIA);
  await salvarMemoria();
  return res.sendStatus(200);
});

  return router;
}
