// utils/rotinaSemanal.js

const desafiosPorDia = {
  domingo:    { categoria: "lógica", dificuldade: "fácil" },
  segunda:    { categoria: "multiplicação", dificuldade: "fácil" },
  terca:      { categoria: "divisão", dificuldade: "fácil" },
  quarta:     { categoria: "português", dificuldade: "média" },
  quinta:     { categoria: "frações", dificuldade: "média" },
  sexta:      { categoria: "problemas", dificuldade: "difícil" },
  sabado:     { categoria: "misturado", dificuldade: "livre" },
};

function obterDesafioDoDia() {
  const diaAtual = new Date().toLocaleDateString("pt-BR", { weekday: "long" }).toLowerCase();
  return desafiosPorDia[diaAtual] || desafiosPorDia["segunda"];
}

module.exports = { obterDesafioDoDia };
