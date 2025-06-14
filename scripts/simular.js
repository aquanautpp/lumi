process.env.NODE_ENV          = 'test';
process.env.LIMITE_INTERACOES = '100';
process.env.OPENAI_API_KEY  ??= 'dummy';
process.env.WHATSAPP_TOKEN  ??= 'dummy';
process.env.VERIFY_TOKEN    ??= 'test';
process.env.PHONE_ID        ??= 'dummy';
process.env.MOCK = '1';

const FROM = 'whatsapp:+5511999999999';

import request from 'supertest';
const { default: app } = await import('../src/app.js');

async function simulate(body) {
  global.__twiMLMessages = [];
  await request(app).post('/webhook').send({
    object: 'whatsapp_business_account',
    entry: [{
      id: 'batch',
      changes: [{
        field: 'messages',
        value: {
          messages: [{ id: Date.now().toString(), from: FROM,
                       text:{ body }, type:'text' }],
          metadata: { phone_number_id:'sandbox' }
        }
      }]
    }]
  });
  const reply = global.__twiMLMessages.pop()?.body || '[sem resposta]';
  console.log(`Você: ${body}\nLumi: ${reply}\n`);
}

// ---------- LOTE DE 150 MENSAGENS ----------
const msgs = [
  'Oi', 'Meu nome é Ana', 'menu', 'Desafio de lógica', '32',
  'Desafio de lógica', '8', 'qual era a resposta', 'Desafio de matemática',
  '999', '42', 'charada', 'qual a explicacao', 'missão do dia',
  '1','2','3','O que mais?','desafio em família','desafio da vida real',
  'aventura','A','B','C','aventura','Ping','Ping','Ping','Ping','Ping',
  'Ping','5','5','meuestilo','Qual meu nível?','Quem descobriu o Brasil?',
  'exportar analytics','menu','Parar','Oi novamente',
  /* --- repete bloco para chegar a 150 --- */
  ...Array(3).fill([
    'Oi','Nome João','menu','Desafio de lógica','20','Desafio de lógica',
    '16','qual era a resposta','Desafio de matemática','321','42','charada',
    'qual a explicacao','missão do dia','1','2','3','mais desafio',
    'desafio em família','desafio da vida real','aventura','A','B','C',
    'aventura','Ping','Ping','Ping','Ping','Ping','Ping','5','5',
    'meuestilo','Qual meu nível?','Quem descobriu a América?',
    'exportar analytics','menu','Parar','Oi novamente'
  ].flat())
].flat().slice(0,150);          // garante exatamente 150 itens

// ---------- EXECUÇÃO ----------
for (const m of msgs) await simulate(m);
console.log('✅ Lote concluído:', msgs.length, 'mensagens');
