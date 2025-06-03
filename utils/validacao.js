function validarResposta(respostaUsuario, respostaCorreta, sinonimos = []) {
  const normalizar = (str) => str.trim().toLowerCase().replace(/\s+/g, ' ');

  const mapaNumeros = {
    zero: '0',
    nenhum: '0',
    uma: '1',
    um: '1',
    dois: '2',
    duas: '2',
    tres: '3',
    'três': '3',
    quatro: '4',
    cinco: '5',
    seis: '6',
    sete: '7',
    oito: '8',
    nove: '9',
    dez: '10'
  };

  const normalizarNumero = (str) => (mapaNumeros[str] !== undefined ? mapaNumeros[str] : str);

  const usuarioNormalizado = normalizarNumero(normalizar(respostaUsuario));
  const corretaNormalizada = normalizarNumero(normalizar(respostaCorreta));
  
  // Comparação numérica, se aplicável
  if (!isNaN(usuarioNormalizado) && !isNaN(corretaNormalizada)) {
    return parseFloat(usuarioNormalizado) === parseFloat(corretaNormalizada);
  }

  // Verificação com sinônimos
  const respostasAceitaveis = [corretaNormalizada, ...sinonimos.map((s) => normalizarNumero(normalizar(s)))];
  return respostasAceitaveis.includes(usuarioNormalizado);
}

export { validarResposta };
// feat: adiciona função de validação de respostas com sinônimos
