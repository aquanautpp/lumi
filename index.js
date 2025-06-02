import express from 'express';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generatePdfReport } from './utils/pdfReport.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const FROM_PHONE_ID = process.env.FROM_PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'lumi123';

const memoriaUsuarios = {};
const desafiosPendentes = {};

const desafiosPorDia = {
  0: 'logica',       // domingo
  1: 'matematica',   // segunda
  2: 'portugues',    // terça
  3: 'logica',       // quarta
  4: 'matematica',   // quinta
  5: 'portugues',    // sexta
  6: 'charada'       // sábado
};

const desafios = {
  matematica: [
    { enunciado: 'Quanto é 7 x 6?', resposta: '42', tipo: 'narrativo' },
    { enunciado: 'Se você tem 8 balas e dá 3 para seu amigo, com quantas fica?', resposta: '5', tipo: 'visual' },
    { enunciado: 'Qual é o dobro de 12?', resposta: '24', tipo: 'visual' }
  ],
  logica: [
    { enunciado: 'Sou par e maior que 10, mas menor que 14. Quem sou eu?', resposta: '12', tipo: 'cinestesico' }
  ],
  portugues: [
    { enunciado: 'Qual é o plural de "cão"?', resposta: 'cães', tipo: 'auditivo' },
    { enunciado: 'Complete: "As ______ estão felizes."', resposta: 'crianças', tipo: 'auditivo' }
  ],
  charada: [
    { enunciado: '🍎🍎🍎 + 🍌🍌 = 8. Quanto vale cada fruta?', resposta: 'maçã=2, banana=1', tipo: 'visual' }
  ]
};
function escolherDesafioAdaptativo(numero) {
  const hoje = new Date().getDay();
  const categoriaHoje = desafiosPorDia[hoje] || 'matematica';

  // Se for sábado e o tema for "charada", priorizar esse
  if (categoriaHoje === 'charada') {
    return { categoria: 'charada', ...desafios.charada[0] };
  }

  // Adaptar ao estilo preferido da criança
  const estilos = memoriaUsuarios[numero]?.estilo || {};
  const tipoMaisForte = Object.entries(estilos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'visual';

  const candidatos = desafios[categoriaHoje].filter((d) => d.tipo === tipoMaisForte);
  const desafio = candidatos.length > 0
    ? candidatos[Math.floor(Math.random() * candidatos.length)]
    : desafios[categoriaHoje][Math.floor(Math.random() * desafios[categoriaHoje].length)];

  return { categoria: categoriaHoje, ...desafio };
}

function fraseMotivacional(acertou) {
  return acertou
    ? 'Mandou bem! Isso é pensar com lógica 🎯'
    : 'Quase! Vamos tentar de novo juntos? 💡';
}

function nivelAtual(estrelas) {
  if (estrelas < 5) return 'Iniciante ⭐';
  if (estrelas < 10) return 'Explorador 🔍';
  if (estrelas < 15) return 'Desafiante 💥';
  return 'Mestre Lumi 🧠';
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
  if (acertou) user.estrelas += 1;

  if (!user.categorias[categoria]) {
    user.categorias[categoria] = { acertos: 0, erros: 0 };
  }

  if (acertou) user.categorias[categoria].acertos++;
  else user.categorias[categoria].erros++;

  if (tipoDesafio && user.estilo[tipoDesafio] !== undefined) {
    if (acertou) user.estilo[tipoDesafio] += 1;
    else user.estilo[tipoDesafio] -= 1;
  }

  user.historico.push({ data: new Date().toISOString(), categoria, acertou, tipoDesafio });
}

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
    console.error('❌ Erro de rede ao enviar mensagem:', error);
  }
}
// Webhook principal
app.post('/webhook', async (req, res) => {
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return res.sendStatus(200);

  const from = message.from;
  const texto = message.text?.body?.toLowerCase() || '';

  console.log(`📩 Mensagem recebida de ${from}: "${texto}"`);

  if (texto.includes('quem criou') || texto.includes('criador')) {
    await enviarMensagemWhatsApp(from, 'Fui criada por Victor Pires! 💡');
    return res.sendStatus(200);
  }

  if (texto.includes('meu progresso')) {
    const user = memoriaUsuarios[from];
    if (!user) {
      await enviarMensagemWhatsApp(from, 'Ainda não registrei nenhum progresso seu!');
    } else {
      const estrelas = user.estrelas;
      const resumo = Object.entries(user.categorias)
        .map(([cat, val]) => `${cat}: ✅${val.acertos} ❌${val.erros}`)
        .join('\n');
      const nivel = nivelAtual(estrelas);

      await enviarMensagemWhatsApp(from,
        `⭐ Você acumulou ${estrelas} estrelas!\n📘 Nível: ${nivel}\n\n📊 Desempenho:\n${resumo}`);
    }
    return res.sendStatus(200);
  }

  if (desafiosPendentes[from]) {
    const esperado = desafiosPendentes[from];
    const acertou = texto.trim().toLowerCase() === esperado.resposta.toLowerCase();
    const feedback = fraseMotivacional(acertou);

    await enviarMensagemWhatsApp(from, feedback);
    atualizarMemoria(from, esperado.categoria, acertou, esperado.tipo || 'geral');
    delete desafiosPendentes[from];
    return res.sendStatus(200);
  }

  const { categoria, enunciado, resposta, tipo } = escolherDesafioAdaptativo(from);
  desafiosPendentes[from] = { categoria, resposta, tipo };

  const prompt = `Você é a Lumi, tutora virtual. A criança disse: "${texto}". Responda com leveza e clareza, e finalize com uma pergunta para engajar.`;

  try {
    const respostaAI = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    const textoGerado = respostaAI.choices[0].message.content.trim();
    const final = `${textoGerado}\n\n🌟 Desafio do dia (${categoria}):\n${enunciado}`;
    await enviarMensagemWhatsApp(from, final);
  } catch (err) {
    console.error('❌ Erro com o GPT:', err);
    await enviarMensagemWhatsApp(from, 'Opa! Tive um probleminha. Pode tentar de novo?');
  }

  res.sendStatus(200);
});

// Verificação inicial do webhook
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

// Geração do relatório PDF
app.get('/relatorio/:numero', async (req, res) => {
  const numero = req.params.numero;
  const nome = memoriaUsuarios[numero]?.nome || 'Aluno Teste';
  const progresso = memoriaUsuarios[numero]?.historico || [];
  const caminho = path.resolve(__dirname, `tmp/relatorio-${numero}.pdf`);

  try {
    generatePdfReport({ nome, numero, progresso, caminho });
    res.download(caminho, `relatorio-${numero}.pdf`, (err) => {
      if (err) console.error('❌ Erro ao enviar PDF:', err);
      fs.unlink(caminho, (unlinkErr) => {
        if (unlinkErr) console.error('❌ Erro ao deletar PDF:', unlinkErr);
      });
    });
  } catch (err) {
    console.error('❌ Erro ao gerar relatório:', err);
    res.status(500).send('Erro ao gerar relatório');
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Lumi está rodando na porta ${PORT}`);
});
