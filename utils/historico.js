import { salvarMemoria, memoriaUsuarios } from './memoria.js';

function atualizarMemoria(numero, categoria, acertou, respostaUsuario, respostaCorreta) {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = {
      nome: null,
      historico: [],
             nivelAnterior: 1
             nivelAtual: 1
    };
  }

  memoriaUsuarios[numero].historico.push({
    data: new Date().toISOString(),
    categoria,
    respostaUsuario,
    respostaCorreta,
    acertou
  });

  salvarMemoria();
}

export { atualizarMemoria };
