import express from 'express';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generatePdfReport } from './utils/pdfReport.js';

// Carrega variáveis do .env
dotenv.config();

// Configuração de caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variáveis de ambiente
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const FROM_PHONE_ID = process.env.FROM_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'lumi123';

// Estado em memória
const memoriaUsuarios = {}; // chave: número; valor: dados de progresso
const desafiosPendentes = {};

// Desafios disponíveis
const desafios = {
  matematica: [
    { enunciado: 'Se você tem 8 balas e dá 3 para seu amigo, com quantas fica?', resposta: '5', tipo: 'visual' },
    { enunciado: 'Quanto é 7 x 6?', resposta: '42', tipo: 'narrativo' }
  ],
  logica: [
    { enunciado: 'Sou par e maior que 10, mas menor que 14. Quem sou eu?', resposta: '12', tipo: 'cinestesico' }
  ],
  portugues: [
    { enunciado: 'Qual é o plural de "cão"?', resposta: 'cães', tipo: 'auditivo' }
  ]
};

// Funções utilitárias
function escolherDesafioAleatorio() {
  const categorias = Object.keys(desafios);
  const categoria = categorias[Math.floor(Math.random() * categorias.length)];
  const desafio = desafios[categoria][Math.floor(Math.random() * desafios[categoria].length)];
  return { categoria, ...desafio };
}

function fraseMotivacional(acertou) {
  return acertou
    ? 'Mandou bem! Isso é pensar com lógica 🎯'
    : 'Quase! Vamos tentar de novo juntos? 💡';
}

function atualizarMemoria(numero, categoria, acertou, tipoDesafio = 'geral') {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = {
      nome: null,
      estrelas: 0,
      estilo: {
        visual: 0,
        auditivo: 0,
        narrativo: 0,
        cinestesico: 0
      },
      categorias: {},
      historico: []
    };
  }

  const user = memoriaUsuarios[numero];

  // Atualiza estrelas
  if (acertou) user.estrelas += 1;

  // Atualiza categorias
  if (!user.categorias[categoria]) {
    user.categorias[categoria] = { acertos: 0, erros: 0 };
  }

  if (acertou) {
    user.categorias[categoria].acertos++;
  } else {
    user.categorias[categoria].erros++;
  }

  // Atualiza estilo de aprendizagem
  if (tipoDesafio && user.estilo[tipoDesafio] !== undefined) {
    if (acertou) user.estilo[tipoDesafio]++;
    else user.estilo[tipoDesafio] = Math.max(user.estilo[tipoDesafio] - 1, 0);
  }

  // Salva no histórico
  user.historico.push({
    data: new Date().toISOString(),
    categoria,
    acertou,
    tipoDesafio
  });
}

// Envio de mensagens via API do WhatsApp (Meta)
async function enviarMensagemWhatsApp(to, mensagem) {
  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${FROM_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: mensagem }
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro ao enviar mensagem pelo WhatsApp:', errorData);
    }
  } catch (error) {
    console.error('❌ Erro de rede ao enviar mensagem pelo WhatsApp:', error);
  }
}

// Webhook para recebimento de mensagens
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (!body?.entry?.[0]?.changes?.[0]?.value?.messages) return res.sendStatus(200);

  const message = body.entry[0].changes[0].value.messages[0];
  const from = message.from;
  const texto = message.text?.body?.toLowerCase() || '';

  console.log(`📩 Mensagem recebida de ${from}: "${texto}"`);

  // Respostas diretas
  if (texto.includes('quem criou') || texto.includes('criador')) {
    await enviarMensagemWhatsApp(from, 'Fui criada por Victor Pires! 💡');
    return res.sendStatus(200);
  }

  // Consultar progresso
  if (texto.includes('meu progresso')) {
    const user = memoriaUsuarios[from];
    if (!user) {
      await enviarMensagemWhatsApp(from, 'Ainda não registrei nenhum progresso seu!');
    } else {
      const estrelas = user.estrelas;
      const resumo = Object.entries(user.categorias)
        .map(([cat, val]) => `${cat}: ✅${val.acertos} ❌${val.erros}`)
        .join('\n');

      await enviarMensagemWhatsApp(from,
        `⭐ Você acumulou ${estrelas} estrelas!\n\n📊 Seu desempenho:\n${resumo}`);
    }
    return res.sendStatus(200);
  }

  // Verificação de desafio pendente
  if (desafiosPendentes[from]) {
    const esperado = desafiosPendentes[from];
    const acertou = texto.trim() === esperado.resposta;
    const feedback = fraseMotivacional(acertou);
    await enviarMensagemWhatsApp(from, feedback);
    atualizarMemoria(from, esperado.categoria, acertou, esperado.tipo || 'geral');
    delete desafiosPendentes[from];
    return res.sendStatus(200);
  }

  // Início de nova interação + desafio
  const { categoria, enunciado, resposta, tipo } = escolherDesafioAleatorio();
  desafiosPendentes[from] = { categoria, resposta, tipo };

  const prompt = `Você é a Lumi, tutora virtual. A criança disse: "${texto}". Responda de forma simples, divertida e clara, e termine com uma pergunta para engajar.`;

  try {
    const respostaAI = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    const textoGerado = respostaAI.choices[0].message.content.trim();
    const final = `${textoGerado}\n\nAqui vai um desafio de ${categoria}: ${enunciado}`;
    await enviarMensagemWhatsApp(from, final);
  } catch (err) {
    console.error('❌ Erro com o GPT:', err);
    await enviarMensagemWhatsApp(from, 'Opa! Tive um probleminha. Pode tentar de novo?');
  }

  res.sendStatus(200);
});

// Verificação inicial de webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verificação falhou');
  }
});

// Endpoint para gerar relatório em PDF
app.get('/relatorio/:numero', async (req, res) => {
  const numero = req.params.numero;
  const nome = memoriaUsuarios[numero]?.nome || 'Aluno Teste';
  const progresso = memoriaUsuarios[numero]?.historico || [];
  const caminho = path.join(__dirname, `relatorio-${numero}.pdf`);

  try {
    generatePdfReport({ nome, numero, progresso, caminho });
    res.download(caminho, `relatorio-${numero}.pdf`, (err) => {
      if (err) {
        console.error('❌ Erro ao enviar PDF:', err);
      }
      // Remove o arquivo após o download (opcional, já que o disco do Render é efêmero)
      fs.unlink(caminho, (unlinkErr) => {
        if (unlinkErr) console.error('❌ Erro ao deletar PDF:', unlinkErr);
      });
    });
  } catch (err) {
    console.error('❌ Erro ao gerar relatório:', err);
    res.status(500).send('Erro ao gerar relatório');
  }
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Lumi rodando na porta ${PORT}`);
});
