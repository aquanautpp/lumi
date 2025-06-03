import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const MEMORIA_PATH = process.env.JSON_PATH || 'memoria.json';
const DESAFIOS_PATH = 'desafiosPendentes.json';

// Objetos exportáveis (referência será mantida)
const memoriaUsuarios = {};
const desafiosPendentes = {};

// Carregar memória do disco
function carregarMemoria() {
  if (fs.existsSync(MEMORIA_PATH)) {
    const dados = JSON.parse(fs.readFileSync(MEMORIA_PATH));
    Object.assign(memoriaUsuarios, dados);
    console.log('✅ Memória dos usuários carregada.');
  }
  if (fs.existsSync(DESAFIOS_PATH)) {
    const desafios = JSON.parse(fs.readFileSync(DESAFIOS_PATH));
    Object.assign(desafiosPendentes, desafios);
    console.log('✅ Desafios pendentes carregados.');
  }
}

// Salvar memória no disco
function salvarMemoria() {
  fs.writeFileSync(MEMORIA_PATH, JSON.stringify(memoriaUsuarios, null, 2));
  fs.writeFileSync(DESAFIOS_PATH, JSON.stringify(desafiosPendentes, null, 2));
}

// Executa o carregamento imediatamente
carregarMemoria();

export { memoriaUsuarios, desafiosPendentes, salvarMemoria };
