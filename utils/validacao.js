function validarResposta(respostaUsuario, respostaCorreta, sinonimos = []) {
  const normalizar = (str) =>
    str.trim().toLowerCase().replace(/\s+/g, ' ');

  const usuarioNormalizado = normalizar(respostaUsuario);
  const corretaNormalizada = normalizar(respostaCorreta);

  // Comparação numérica, se aplicável
  if (!isNaN(usuarioNormalizado) && !isNaN(corretaNormalizada)) {
    return parseFloat(usuarioNormalizado) === parseFloat(corretaNormalizada);
  }

  // Verificação com sinônimos
  const respostasAceitaveis = [corretaNormalizada, ...sinonimos.map(normalizar)];
  return respostasAceitaveis.includes(usuarioNormalizado);
}

export { validarResposta };
feat: adiciona função de validação de respostas com sinônimos
