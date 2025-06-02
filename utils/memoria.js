import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const MEMORIA_PATH = process.env.JSON_PATH || 'memoria.json';
const DESAFIOS_PATH = 'desafiosPendentes.json';

let memoriaUsuarios = {};
let desafiosPendentes = {};

// Carregar memória do disco
function carregarMemoria() {
  if (fs.existsSync(MEMORIA_PATH)) {
    memoriaUsuarios = JSON.parse(fs.readFileSync(MEMORIA_PATH));
    console.log('✅ Memória dos usuários carregada.');
  }
  if (fs.existsSync(DESAFIOS_PATH)) {
    desafiosPendentes = JSON.parse(fs.readFileSync(DESAFIOS_PATH));
    console.log('✅ Desafios pendentes carregados.');
  }
}

// Salvar memória no disco
function salvarMemoria() {
  fs.writeFileSync(MEMORIA_PATH, JSON.stringify(memoriaUsuarios, null, 2));
  fs.writeFileSync(DESAFIOS_PATH, JSON.stringify(desafiosPendentes, null, 2));
}

carregarMemoria();

export { memoriaUsuarios, desafiosPendentes, salvarMemoria };
