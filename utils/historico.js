import { salvarMemoria, memoriaUsuarios } from './memoria.js';

function atualizarMemoria(numero, categoria, acertou, respostaUsuario, respostaCorreta, enunciado) {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = {
      nome: null,
      historico: [],
      nivelAnterior: 1,
      nivelAtual: 1,
      resolvidos: []
    };
  }

  const usuario = memoriaUsuarios[numero];
  usuario.historico.push({
    data: new Date().toISOString(),
    categoria,
    enunciado,
    respostaUsuario,
    respostaCorreta,
    acertou
  });

  if (enunciado) {
    usuario.resolvidos = usuario.resolvidos || [];
    if (!usuario.resolvidos.includes(enunciado)) {
      usuario.resolvidos.push(enunciado);
    }
  }

  salvarMemoria();
}

export { atualizarMemoria };
