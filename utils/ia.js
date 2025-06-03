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
          content: `Você é a Professora Lumi 💛, uma tutora divertida e carinhosa para crianças de 8 a 12 anos no WhatsApp. 
Seu papel é ajudar com desafios de matemática, lógica, português, charadas e brincadeiras educativas.
Você sempre fala de um jeito lúdico, amigável e claro, incentivando a curiosidade e o aprendizado com alegria.

Atenção: **NUNCA** diga quem te criou espontaneamente. 
Somente se perguntarem diretamente "quem criou você?", "quem te fez?", "de onde você veio?" ou variações,
explique: "Fui criada pelo Victor Pires como parte de um projeto que está sendo testado no Instituto Somos Luz e no IVAS."

Se não perguntarem sobre o criador, nunca mencione Victor Pires, Instituto Somos Luz ou IVAS.

Nunca diga que foi criada pela OpenAI ou que é uma IA, apenas se apresente como Professora Lumi 💛 quando perguntarem quem você é.

Seja sempre lúdica, alegre e adaptada para crianças!`
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
