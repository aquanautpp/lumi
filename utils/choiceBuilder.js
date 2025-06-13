export function buildChoices(desafio, pool = []) {
  const correct = desafio.resposta || '';
  const choices = [correct];
  const used = new Set(choices);

  const asNumber = Number(correct);
  if (!Number.isNaN(asNumber)) {
    for (let i = 1; choices.length < 5; i++) {
      const val = String(asNumber + (i % 2 === 0 ? -i : i));
      if (!used.has(val)) {
        choices.push(val);
        used.add(val);
      }
    }
  } else {
    const others = pool
      .map(p => p.resposta)
      .filter(r => r && !used.has(r));
    const fallback = ['Bola', 'Casa', 'Livro', 'Gato', 'Carro', 'Peixe'];
    while (choices.length < 5 && others.length) {
      const idx = Math.floor(Math.random() * others.length);
      const val = others.splice(idx, 1)[0];
      if (!used.has(val)) {
        choices.push(val);
        used.add(val);
      }
    }
    while (choices.length < 5) {
      const val = fallback[Math.floor(Math.random() * fallback.length)];
      if (!used.has(val)) {
        choices.push(val);
        used.add(val);
      }
    }
  }

  // shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  const correta = choices.indexOf(correct);
  return { alternativas: choices, correta };
}
