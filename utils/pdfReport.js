import PDFDocument from 'pdfkit';
import fs from 'fs';
import { definirNivel } from './niveis.js';

function generatePdfReport({ nome, numero, progresso, caminho }) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(caminho));

  // Borda
  doc.rect(20, 20, 570, 750).stroke();

  // Cabeçalho
  doc
    .fontSize(20)
    .fillColor('purple')
    .text('📘 Relatório de Progresso - Professora Lumi 💜', { align: 'center' })
    .moveDown();

  // Nome e número
  doc
    .fontSize(16)
    .fillColor('blue')
    .text(`👤 Aluno: ${nome || 'Nome não informado'}`, { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(14)
    .fillColor('black')
    .text(`📱 Número: ${numero}`)
    .moveDown();

  // Estrelas e nível
  const totalEstrelas = progresso.filter(p => p.acertou).length;
  const nivel = definirNivel(totalEstrelas);

  doc
    .fontSize(14)
    .fillColor('green')
    .text(`⭐ Estrelas acumuladas: ${totalEstrelas}`)
    .text(`🏆 Nível: ${nivel}`, { underline: true })
    .moveDown();

  // Histórico
  doc
    .fontSize(16)
    .fillColor('purple')
    .text('📊 Histórico de Desafios', { underline: true })
    .moveDown(0.5);

  if (progresso.length === 0) {
    doc.fontSize(12).fillColor('black').text('Nenhum desafio registrado ainda. 🚀');
  } else {
    progresso.slice(-10).reverse().forEach((item, index) => {
      const data = new Date(item.data).toLocaleString('pt-BR');
      const resultado = item.acertou ? '✅ Acertou' : '❌ Errou';
      const estilo = item.tipoDesafio ? ` (${item.tipoDesafio})` : '';
      const respostaUsuario = item.respostaUsuario ? ` - Resposta: ${item.respostaUsuario}` : '';
      const respostaCorreta = item.respostaCorreta ? ` - Correta: ${item.respostaCorreta}` : '';
      doc
        .fontSize(12)
        .fillColor('black')
        .text(`${index + 1}. [${data}] ${resultado} - ${item.categoria}${estilo}${respostaUsuario}${respostaCorreta}`);
    });
  }

  doc.end();
}

export { generatePdfReport };
