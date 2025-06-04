import fs from 'fs';

const MEMORIA_ARQUIVO = 'memoria.json';
const DESAFIOS_PENDENTES_ARQUIVO = 'desafiosPendentes.json';

function carregarMemoria() {
  if (fs.existsSync(MEMORIA_ARQUIVO)) {
    try {
      global.memoriaUsuarios = JSON.parse(fs.readFileSync(MEMORIA_ARQUIVO));
      console.log('✅ Memória carregada');
    } catch (err) {
      console.error('❌ Erro ao carregar memória:', err);
      global.memoriaUsuarios = {};
    }
  } else {
    global.memoriaUsuarios = {};
  }
}

function carregarDesafiosPendentes() {
  if (fs.existsSync(DESAFIOS_PENDENTES_ARQUIVO)) {
    try {
      global.desafiosPendentes = JSON.parse(fs.readFileSync(DESAFIOS_PENDENTES_ARQUIVO));
      console.log('✅ Desafios pendentes carregados');
    } catch (err) {
      console.error('❌ Erro ao carregar desafios pendentes:', err);
      global.desafiosPendentes = {};
    }
  } else {
    global.desafiosPendentes = {};
  }
}

async function salvarMemoria() {
  if (process.env.DB_TYPE === 'sqlite') {
    await salvarDb(global.memoriaUsuarios);
    return;
  }
  try {
    fs.writeFileSync(MEMORIA_ARQUIVO, JSON.stringify(global.memoriaUsuarios, null, 2));
  } catch (err) {
    console.error('❌ Erro ao salvar memória:', err);
  }
}

function salvarDesafiosPendentes() {
  try {
    fs.writeFileSync(DESAFIOS_PENDENTES_ARQUIVO, JSON.stringify(global.desafiosPendentes, null, 2));
  } catch (err) {
    console.error('❌ Erro ao salvar desafios pendentes:', err);
  }
}

export {
  carregarMemoria,
  carregarDesafiosPendentes,
  salvarMemoria,
  salvarDesafiosPendentes
};
// feat: adiciona persistência em disco para memória e desafios pendentes
