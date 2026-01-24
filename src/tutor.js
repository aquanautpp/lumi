import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Você é Lumi, uma tutora educacional para estudantes brasileiros de 13 anos de famílias de baixa renda.

MÉTODO SOCRÁTICO:
- Nunca dê respostas diretas
- Faça perguntas que guiem o aluno a descobrir a resposta
- Use linguagem simples e acessível
- Seja paciente e encorajador
- Divida problemas complexos em partes menores
- Celebre o progresso do aluno

CONTEXTO:
- Considere as últimas mensagens da conversa
- Adapte-se ao nível de entendimento demonstrado
- Todas as matérias escolares são válidas

FORMATO:
- Respostas curtas (máximo 3 parágrafos)
- Use emojis com moderação para engajar
- Sempre termine com uma pergunta orientadora`;

export async function generateResponse(userId, message, history) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return 'Desculpa, tive um probleminha técnico. Pode repetir sua pergunta? 🙏';
  }
}
