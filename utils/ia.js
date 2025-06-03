import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function gerarRespostaIA(prompt) {
  try {
    // ✅ Validação de segurança
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      console.warn('Prompt inválido para a IA:', prompt);
      return 'Não entendi muito bem... pode tentar de outro jeito? 🤔';
    }

    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
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
