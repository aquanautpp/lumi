# Lumi WhatsApp Bot

Lumi é um bot educativo para WhatsApp que envia desafios, missões do dia e relatórios de desempenho em PDF. Também possui atividades em família, jogos visuais e uma aventura interativa.

## Instalação

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Copie o arquivo `.env.example` para `.env` e preencha as variáveis obrigatórias.

```bash
cp env.example .env
```

3. Execute os testes para verificar a instalação:

```bash
npm test
```

4. Inicie o servidor local:

```bash
npm start
```

O webhook ficará disponível na porta definida em `PORT` (padrão 3000).

## Comandos

Envie mensagens no WhatsApp com os seguintes textos para interagir com a Lumi:

- `Quero a missão do dia`
- `Quero um desafio`
- `Quem é você?`
- `Qual meu nível?`
- `Relatório`
- `Desafio em família`
- `Desafio da vida real`
- `Jogo visual`
- `Aventura`
- `Charada`
- `Parar`

## Testes

Os testes utilizam Jest. Rode `npm test` para executá-los.
