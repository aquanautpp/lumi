import app from './app.js';
import { enviarMensagemWhatsApp } from '../utils/whatsapp.js';

const PORT = process.env.PORT || 3000;

process.on('uncaughtException', err => {
  console.error(err);
  if (global.lastUserNumber) {
    enviarMensagemWhatsApp(global.lastUserNumber, 'Desculpa, tive um probleminha e já estou reiniciando 💜');
  }
});

process.on('unhandledRejection', err => {
  console.error(err);
  if (global.lastUserNumber) {
    enviarMensagemWhatsApp(global.lastUserNumber, 'Desculpa, tive um probleminha e já estou reiniciando 💜');
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Servidor ouvindo na porta ${PORT}`));
}
