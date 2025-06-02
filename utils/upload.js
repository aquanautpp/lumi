import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: 'dhcjegidn',
  api_key: '177781556747589',
  api_secret: 'oQUUi8iNmO45-QWNESmLl616mqs'
});

async function uploadPdfToServer(caminhoLocal) {
  try {
    const result = await cloudinary.uploader.upload(caminhoLocal, {
      resource_type: 'raw', // importante para arquivos PDF
      folder: 'lumi-pdfs'
    });
    console.log(`✅ PDF enviado para Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Erro ao enviar PDF para Cloudinary:', error);
    throw error;
  }
}

export { uploadPdfToServer };
