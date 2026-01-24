import { Telegraf } from 'telegraf';
import { generateResponse } from './tutor.js';
import { getHistory, addMessage } from './storage.js';

const MENU_TEXT = `🎓 *Lumi - Sua Tutora*

Olá! Sou a Lumi, sua tutora de estudos.

*O que posso fazer:*
• Ajudar com qualquer matéria escolar
• Explicar conceitos difíceis
• Guiar você a encontrar as respostas

*Como usar:*
Basta me enviar sua dúvida! Vou te ajudar a pensar e descobrir a resposta.

/menu - Ver este menu
/ajuda - Pedir ajuda`;

const HELP_TEXT = `🆘 *Precisa de ajuda?*

Pode me perguntar sobre qualquer matéria:
• Matemática
• Português
• Ciências
• História
• Geografia
• E muito mais!

Basta digitar sua dúvida que eu te ajudo a pensar na resposta! 💡`;

export function createBot() {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  // /start command
  bot.start((ctx) => {
    ctx.replyWithMarkdown(MENU_TEXT);
  });

  // /menu command
  bot.command('menu', (ctx) => {
    ctx.replyWithMarkdown(MENU_TEXT);
  });

  // /ajuda command
  bot.command('ajuda', (ctx) => {
    ctx.replyWithMarkdown(HELP_TEXT);
  });

  // Text message handler
  bot.on('text', async (ctx) => {
    const userId = ctx.from.id.toString();
    const message = ctx.message.text;

    // Get conversation history
    const history = getHistory(userId);

    // Show typing indicator
    await ctx.sendChatAction('typing');

    // Generate Socratic response
    const response = await generateResponse(userId, message, history);

    // Save messages to history
    addMessage(userId, 'user', message);
    addMessage(userId, 'assistant', response);

    // Send response
    await ctx.reply(response);
  });

  return bot;
}
