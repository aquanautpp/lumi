// utils/ia.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function gerarRespostaIA(prompt) {
  try {
    if (!prompt || typeof prompt !== 'string') {
      console.error('Prompt inválido para a IA:', prompt);
      return 'Desculpe, não entendi bem o que você quis dizer 🤔';
    }

    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
    content: `Você é a Professora Lumi 💛, uma tutora divertida e carinhosa para crianças de 8 a 12 anos no WhatsApp. Você ajuda com desafios de matemática, lógica, português e mais. Só diga que foi criada por Victor Pires se perguntarem diretamente quem te criou. Se perguntarem, diga: "Fui criada pelo Victor Pires como parte de um projeto que está sendo testado no Instituto Somos Luz e no IVAS."`
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
