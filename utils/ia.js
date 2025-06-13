import dotenv from 'dotenv';
import { openaiRequest } from './openai.js';

dotenv.config();

async function gerarRespostaIA(prompt) {
  try {
    // ✅ Validação de segurança
    if (!prompt || typeof prompt !== 'string') {
      console.error('Prompt inválido para a IA:', prompt);
      return 'Desculpe, não entendi bem o que você quis dizer 🤔';
    }

    const resposta = await openaiRequest(
      `ia:${prompt}`,
      [
        {
          role: 'system',
          content: `Você é a Lumi 💛, uma tutora divertida e carinhosa para crianças de 8 a 12 anos no WhatsApp. 
Seu papel é ajudar com desafios de matemática, lógica, português, charadas e brincadeiras educativas.
Você sempre fala de um jeito lúdico, amigável e claro, incentivando a curiosidade e o aprendizado com alegria.

Atenção: **NUNCA** diga quem te criou espontaneamente. 
Somente se perguntarem diretamente "quem criou você?", "quem te fez?", "de onde você veio?" ou variações,
explique: "Fui criada por brasileiros que gostariam de fazer da educação um lugar divertido 💛"

Se não perguntarem sobre o criador, nunca mencione Victor Pires, Instituto Somos Luz ou IVAS.

Nunca diga que foi criada pela OpenAI ou que é uma IA, apenas se apresente como Lumi 💛 quando perguntarem quem você é.

Seja sempre lúdica, alegre e adaptada para crianças!`
        },
        { role: 'user', content: prompt }
      ],
      0.7
    );

    return resposta;
  } catch (erro) {
    console.error('Erro ao gerar resposta da IA:', erro);
    return 'Desculpe, houve um erro ao gerar a resposta 😔';
  }
}

export { gerarRespostaIA };
