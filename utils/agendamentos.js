import cron from 'node-cron';
import { enviarMensagemWhatsApp } from './mensagem.js';
import { enviarMidiaWhatsApp } from './midia.js';
import { generatePdfReport } from './pdfReport.js';
import { uploadPdfToServer } from './upload.js';
import { memoriaUsuarios } from './memoria.js';

const desafiosFamilia = [
  { enunciado: 'Cada um deve dizer um número. Quem disser o maior ganha!' }
];

function agendarEnvioRelatorios() {
  cron.schedule('0 9 * * 1', async () => {
    console.log('📅 Enviando relatórios semanais...');
    for (const [numero, usuario] of Object.entries(memoriaUsuarios)) {
      const caminho = `tmp/relatorio-${numero}.pdf`;
      generatePdfReport({ nome: usuario.nome || 'Aluno', numero, progresso: usuario.historico, caminho });
      const urlPdf = await uploadPdfToServer(caminho);
      await enviarMidiaWhatsApp(numero, 'document', urlPdf);
    }
  });
}

function agendarDesafiosFamilia() {
  cron.schedule('0 10 * * 0', () => {
    for (const numero of Object.keys(memoriaUsuarios)) {
      const desafio = desafiosFamilia[0];
      enviarMensagemWhatsApp(numero, `🌟 Desafio em família: ${desafio.enunciado}`);
    }
  });
}

export { agendarEnvioRelatorios, agendarDesafiosFamilia };
// feat: adiciona agendamento de PDF e desafios em família
