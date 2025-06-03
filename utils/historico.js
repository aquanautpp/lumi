import { salvarMemoria } from './persistencia.js';
import { memoriaUsuarios } from './memoria.js'; // Pega memoriaUsuarios de memoria.js

function atualizarMemoria(numero, categoria, acertou, respostaUsuario, respostaCorreta) {
  if (!memoriaUsuarios[numero]) {
    memoriaUsuarios[numero] = {
      nome: null,
      historico: [],
      nivelAnterior: 1
    };
  }

  memoriaUsuarios[numero].historico.push({
    data: new Date().toISOString(),
    categoria,
    respostaUsuario,
    respostaCorreta,
    acertou
  });

  salvarMemoria(); // Salva depois de atualizar
}

export { atualizarMemoria };
