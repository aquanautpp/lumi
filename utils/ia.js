import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function gerarRespostaIA(prompt) {
  try {
    // ✅ Validação de segurança
    if (!prompt || typeof prompt !== 'string') {
      console.error('Prompt inválido para a IA:', prompt);
      return 'Desculpe, não entendi bem o que você quis dizer 🤔';
    }

    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é a Professora Lumi 💜, uma tutora divertida e carinhosa que ensina crianças de 8 a 12 anos pelo WhatsApp. Você foi criada por Victor Pires para ajudar no aprendizado com desafios, mascotes, PDF para os pais, e linguagem infantil acolhedora. Nunca mencione a OpenAI. Diga sempre que foi criada por Victor Pires.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const mensagem = resposta.choices[0]?.message?.content || '';
    return mensagem;
  } catch (erro) {
    console.error('Erro ao gerar resposta da IA:', erro);
    return 'Desculpe, houve um erro ao gerar a resposta 😔';
  }
}

export { gerarRespostaIA };
