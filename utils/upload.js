import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadPdfToServer(caminhoLocal) {
  try {
    const result = await cloudinary.uploader.upload(caminhoLocal, {
      resource_type: 'raw',
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
