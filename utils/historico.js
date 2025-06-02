import { salvarMemoria } from './persistencia.js';

function atualizarMemoria(numero, categoria, acertou, respostaUsuario, respostaCorreta) {
  if (!global.memoriaUsuarios[numero]) {
    global.memoriaUsuarios[numero] = {
      nome: null,
      historico: [],
      nivelAnterior: 1
    };
  }

  global.memoriaUsuarios[numero].historico.push({
    data: new Date().toISOString(),
    categoria,
    respostaUsuario,
    respostaCorreta,
    acertou
  });

  salvarMemoria(); // Persistência após atualização
}

export { atualizarMemoria };
