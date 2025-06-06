import { promises as fs } from 'fs';
import { Parser } from 'json2csv';
import { atualizarSheet } from './googleSheets.js';
import xlsx from 'xlsx';

const USUARIOS_PATH = 'usuarios.json';

async function carregarUsuarios() {
  try {
    await fs.access(USUARIOS_PATH);
    const data = await fs.readFile(USUARIOS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
}
  }

async function salvarUsuarios(usuarios) {
  await fs.writeFile(USUARIOS_PATH, JSON.stringify(usuarios, null, 2));
}

export async function registrarAtividade(id, tipo, categoria, resultado) {
  const usuarios = await carregarUsuarios();
  const hoje = new Date().toISOString().split('T')[0];

  if (!usuarios[id]) {
    usuarios[id] = {
      id,
      nome: null,
      dataEntrada: hoje,
      nivelAtual: 1,
      estiloAprendizagem: null,
      totalAcertos: 0,
      totalErros: 0,
      desafiosConcluidos: [],
      diasAtivos: [],
      responsavel: null,
      tipoDeUsuario: 'real'
    };
  }

  const usuario = usuarios[id];

  usuario.desafiosConcluidos.push({ data: hoje, categoria, resultado });
  if (resultado) {
    usuario.totalAcertos += 1;
  } else {
    usuario.totalErros += 1;
  }

  if (!usuario.diasAtivos.includes(hoje)) {
    usuario.diasAtivos.push(hoje);
  }

  await salvarUsuarios(usuarios);
  return usuario;
}

export async function gerarResumoUsuario(id) {
  const usuarios = await carregarUsuarios();
  const usuario = usuarios[id];
  if (!usuario) return null;

  const total = usuario.desafiosConcluidos.length;
  const percentual = total ? (usuario.totalAcertos / total) * 100 : 0;

  const freqCategorias = {};
  for (const d of usuario.desafiosConcluidos) {
    freqCategorias[d.categoria] = (freqCategorias[d.categoria] || 0) + 1;
  }
  const categoriasComuns = Object.entries(freqCategorias)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);

  const ultimaAtividade = total
    ? usuario.desafiosConcluidos[total - 1].data
    : null;

  return {
    totalDesafios: total,
    percentualAcerto: percentual,
    categoriasMaisComuns: categoriasComuns,
    estiloDetectado: usuario.estiloAprendizagem,
    nivelAtual: usuario.nivelAtual,
    diasAtivos: usuario.diasAtivos.length,
    ultimaAtividade
  };
}

export async function gerarAnalyticsGlobal() {
  const usuarios = await carregarUsuarios();
  const ids = Object.keys(usuarios);
  if (!ids.length) return null;

  const usuariosReais = ids.filter(
    id => usuarios[id].tipoDeUsuario === 'real'
  );

  const estiloFreq = {};
  let totalAcertos = 0;
  let totalErros = 0;
  let totalDesafios = 0;
  const errosPorCategoria = {};

  for (const id of ids) {
    const u = usuarios[id];
    if (u.estiloAprendizagem) {
      estiloFreq[u.estiloAprendizagem] =
        (estiloFreq[u.estiloAprendizagem] || 0) + 1;
    }
    totalAcertos += u.totalAcertos;
    totalErros += u.totalErros;
    totalDesafios += u.desafiosConcluidos.length;
    for (const d of u.desafiosConcluidos) {
      if (!d.resultado) {
        errosPorCategoria[d.categoria] =
          (errosPorCategoria[d.categoria] || 0) + 1;
      }
    }
  }

  const estiloMaisComum = Object.entries(estiloFreq)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  const categoriaMaisErros = Object.entries(errosPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])[0];
  const mediaAcerto = (totalAcertos / (totalAcertos + totalErros)) * 100;
  const mediaDesafios = totalDesafios / ids.length;

  return {
    numeroUsuariosReais: usuariosReais.length,
    estilosMaisComuns: estiloMaisComum,
    categoriaMaisErros,
    mediaAcertoGlobal: mediaAcerto,
    mediaDesafiosPorUsuario: mediaDesafios
  };
}

export async function gerarCSVMetricas() {
  const usuarios = await carregarUsuarios();
  const linhas = Object.values(usuarios).map(u => {
    const total = u.desafiosConcluidos.length;
    const percentual = total ? ((u.totalAcertos / total) * 100).toFixed(2) : '0';
    const ultima = total ? u.desafiosConcluidos[total - 1].data : '';
    return {
      ID: u.id,
      nome: u.nome,
      estilo: u.estiloAprendizagem,
      nivel: u.nivelAtual,
      totalDesafios: total,
      percentualAcerto: percentual,
      ultimaAtividade: ultima,
      tipoDeUsuario: u.tipoDeUsuario
    };
  });

  const parser = new Parser({ delimiter: ';' });
  const csv = parser.parse(linhas);
  await fs.writeFile('metricas.csv', csv);
}

export async function exportarParaExcel() {
  const usuarios = await carregarUsuarios();
  const wb = xlsx.utils.book_new();

  for (const u of Object.values(usuarios)) {
    const dados = u.desafiosConcluidos.map(d => ({
      Data: d.data,
      Categoria: d.categoria,
      Resultado: d.resultado ? 'acerto' : 'erro'
    }));
    const ws = xlsx.utils.json_to_sheet(dados);
    xlsx.utils.book_append_sheet(wb, ws, u.id.toString());
  }

  const resumo = await gerarAnalyticsGlobal();
  const wsResumo = xlsx.utils.json_to_sheet([resumo]);
  xlsx.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  xlsx.writeFile(wb, 'usuarios.xlsx');
}

export async function exportarParaGoogleSheets() {
  const usuarios = await carregarUsuarios();
  const cabecalho = ['ID','Nome','Estilo','Nível','Total Desafios','Acertos','Erros','Última Atividade'];
  const linhas = [cabecalho];
  for (const u of Object.values(usuarios)) {
    const total = u.desafiosConcluidos.length;
    const ultima = total ? u.desafiosConcluidos[total - 1].data : '';
    linhas.push([
      u.id,
      u.nome || '',
      u.estiloAprendizagem || '',
      u.nivelAtual,
      total,
      u.totalAcertos,
      u.totalErros,
      ultima
    ]);
  }
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEETS_ID não definido');
  await atualizarSheet(sheetId, 'Usuarios!A1', linhas);
}
