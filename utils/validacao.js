function validarResposta(respostaUsuario, respostaCorreta, sinonimos = []) {
  const normalizar = (str) => 
        str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]|_/g, '')
      .replace(/\s+/g, ' ');

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

function validarTentativas(respostaUsuario, desafio) {
  desafio.tentativas = (desafio.tentativas || 0) + 1;

  const acertou = validarResposta(
    respostaUsuario,
    desafio.resposta,
    desafio.sinonimos || []
  );

  if (acertou) {
    return { acertou: true };
  }

  const dicasPadrao = [
    '🤔 Pense com calma e tente novamente!',
    '💡 Observe bem a pergunta, a resposta está pertinho!',
    '🎲 Não desista! Tente mais uma vez!'
  ];

  if (desafio.tentativas < 3) {
    const dicas = desafio.dicas || dicasPadrao;
    const indice = (desafio.tentativas - 1) % dicas.length;
    return { acertou: false, dica: dicas[indice] };
  }

  const explicacao =
    desafio.explicacao || `A resposta correta é ${desafio.resposta}.`;
  return { acertou: false, explicacao };
}

export { validarResposta, validarTentativas };
// feat: adiciona função de validação de respostas com sinônimos
