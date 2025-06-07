// index.js
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import { enviarMensagemWhatsApp, enviarMidiaWhatsApp } from './utils/whatsapp.js';
import { escolherDesafioPorCategoria, gerarMissao, enviarCharadaVisual, registrarDesafioResolvido } from './utils/desafios.js';
import {
  memoriaUsuarios,
  desafiosPendentes,
  missoesPendentes,
  salvarMemoria,
  definirNome,
  definirMascote
} from './utils/memoria.js';
import { gerarFeedback } from './utils/feedback.js';
import { atualizarMemoria } from './utils/historico.js';
import { verificarNivel, obterNivel } from './utils/niveis.js';
import { validarResposta, validarTentativas } from './utils/validacao.js';
import { exportarParaGoogleSheets } from './utils/analytics.js';
import { obterDesafioDoDia } from './utils/rotinaSemanal.js';
import { getFala } from './utils/mascote.js';
import { aplicarPerguntaEstilo, processarRespostaEstilo } from './utils/estiloAprendizagem.js';
import { gerarRespostaIA } from './utils/ia.js';
import { enviarDesafioFamilia } from './utils/desafioFamilia.js';
import { enviarDesafioVidaReal } from './utils/desafiosVidaReal.js';
import { iniciarAventura, enviarDesafioAventura } from './utils/aventura.js';

dotenv.config();

function validateEnv() {
  if (process.env.NODE_ENV === 'test') return;
  const required = ['WHATSAPP_TOKEN', 'VERIFY_TOKEN', 'OPENAI_API_KEY'];
  const missing = required.filter(v => !process.env[v]);
    if (!process.env.PHONE_ID && !process.env.FROM_PHONE_ID) {
    missing.push('PHONE_ID');
  }
  if (missing.length) {
    console.error('Missing environment variables: ' + missing.join(', '));
    process.exit(1);
  }
}

validateEnv();

const LIMITE_INTERACOES = parseInt(
  process.env.LIMITE_INTERACOES || '20',
  10
);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

const comandosRapidos = [
  { title: "📚 Missão do Dia", body: "Quero a missão do dia" },
  { title: "🧠 Me dá um desafio", body: "Quero um desafio" },
  { title: "❓Quem é você?", body: "Quem é você?" }
];


const OPCOES_FINAIS = [
  { title: "✅ Sim!", body: "Sim!" },
  { title: "❌ Não por enquanto", body: "Não por enquanto" }
];

function extrairTexto(message) {
  if (message.text?.body) return message.text.body.trim();
  const inter = message.interactive;
  if (inter?.button_reply) return inter.button_reply.id || inter.button_reply.title;
  if (inter?.list_reply) return inter.list_reply.id || inter.list_reply.title;
  return '';
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function enviarMensagemFinalDeTeste(numero) {
  const mensagem =
    "🌟 Você chegou ao fim do modo de teste! Aqui vão algumas dicas para aprender melhor:\n" +
    "1️⃣ Faça perguntas sempre que ficar curioso.\n" +
    "2️⃣ Explique o que aprendeu para alguém.\n" +
    "3️⃣ Crie desenhos ou mapas para suas ideias.\n" +
    "Que tal ler o livro 'Como um Cientista Aprende'?\n\n" +
    "Você gostaria de brincar com a versão oficial da Lumi?";
  return enviarMensagemWhatsApp(numero, mensagem, OPCOES_FINAIS);
}

const comandosDetalhados = [
"📚 'Quero a missão do dia' - Receber três desafios especiais",
  "🧠 'Quero um desafio' - Desafio do dia",
  "❓ 'Quem é você?' - Saber sobre a Lumi",
  "📈 'Qual meu nível?' - Ver seu progresso",
  "🎯 'Meu estilo' - Teste de personalidade",
  "👨‍👩‍👧 'Desafio em família' - Atividade em grupo",
  "🏠 'Desafio da vida real' - Tarefas para fazer em casa",
  "🌋 'Aventura' - Desafio temático",
  "❓ 'Charada' - Enviar uma charada divertida",
  "🛑 'Parar' - Cancelar missões ou desafios"

];

function enviarListaComandos(numero) {
  const textoComandos = comandosDetalhados.join("\n");
  return enviarMensagemWhatsApp(
    numero,
    `Aqui estão alguns comandos que posso entender:\n${textoComandos}`
  );
}

function enviarBoasVindas(numero) {
  return enviarMensagemWhatsApp(
    numero,
     "Oi, eu sou a Lumi 💛. Peça o 'menu' para ver meus comandos e escreva 'Meu estilo' se quiser descobrir seu jeito de aprender!",
    comandosRapidos
  );
}

app.get('/admin', (req, res) => {
  const usuarios = Object.entries(memoriaUsuarios).map(([numero, dados]) => ({
    numero,
    nome: dados.nome || null,
    nivel: dados.nivelAtual || 1,
    missoesPendentes: missoesPendentes[numero]?.desafios?.length || 0,
    desafiosPendentes: desafiosPendentes[numero] ? 1 : 0,
    historico: (dados.historico || []).length
  }));
  res.json({ usuarios });
});

app.get("/admin/export", async (req, res) => {
  try {
    await exportarParaGoogleSheets();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Falha ao exportar" });
  }
});

app.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
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
 
  if (["parar", "cancelar", "sair"].includes(textoLower)) {
    delete missoesPendentes[from];
    delete desafiosPendentes[from];
    await enviarMensagemWhatsApp(from, 'Tudo bem, a gente pode continuar depois! 💛');
    return res.sendStatus(200);
  }

  if (textoLower.includes("qual era a resposta")) {
    const historico = usuario.historico || [];
    const ultimo = historico[historico.length - 1];
    if (ultimo?.respostaCorreta) {
      await enviarMensagemWhatsApp(from, `A resposta correta era: ${ultimo.respostaCorreta}`);
    } else {
      await enviarMensagemWhatsApp(from, 'Não encontrei a última resposta correta 🤔');
    }
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
      const estilo = usuario.estilo?.tipo || null;
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

  const comandosDesafio = ['quero um desafio', 'me da um desafio', 'desafio'];
  if (comandosDesafio.some(c => textoSemAcento.includes(c))) {
    delete desafiosPendentes[from];
    const estilo = usuario.estilo?.tipo || null;
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
    const estilo = usuario.estilo?.tipo || null;
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

    const estilo = usuario.estilo?.tipo || null;
    if (resultado.acertou) {
      registrarDesafioResolvido(from, desafio);
      const feedback = gerarFeedback(true, estilo);
      await enviarMensagemWhatsApp(from, feedback);
      await enviarMensagemWhatsApp(from, getFala('acerto'));
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
      registrarDesafioResolvido(from, desafio);
      await enviarMensagemWhatsApp(from, resultado.explicacao);
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
    }

    await salvarMemoria();
    return res.sendStatus(200);
  }

  const resposta = await gerarRespostaIA(texto);
  await enviarMensagemWhatsApp(from, resposta);
  res.sendStatus(200);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Lumi está rodando na porta ${PORT}`);
  });

}

export default app;
