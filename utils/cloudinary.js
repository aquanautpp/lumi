import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadPdfToCloudinary(filePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: 'raw', // PDF não é imagem nem vídeo
        folder: 'lumi-reports',
        use_filename: true,
        unique_filename: false
      },
      (error, result) => {
        if (error) {
          console.error('❌ Erro ao enviar PDF para o Cloudinary:', error);
          reject(error);
        } else {
          console.log(`✅ PDF enviado com sucesso: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      }
    );
  });
}

export { uploadPdfToCloudinary };
