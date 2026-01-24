import 'dotenv/config';
import { createBot } from './bot.js';
import { loadData } from './storage.js';

// Load persisted data
loadData();

// Create and start bot
const bot = createBot();

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('Shutting down...');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  console.log('Shutting down...');
  bot.stop('SIGTERM');
});

// Start bot
bot.launch()
  .then(() => {
    console.log('🎓 Lumi está online!');
  })
  .catch((error) => {
    console.error('Failed to start bot:', error.message);
    process.exit(1);
  });
