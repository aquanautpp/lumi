# Lumi WhatsApp Bot

Lumi é um bot educativo para WhatsApp que envia desafios, missões do dia e outras atividades para toda a família. Também conta com uma aventura interativa para explorar o aprendizado de forma divertida.

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

### Usando o Twilio Sandbox

Para testes no Twilio WhatsApp Sandbox, preencha também as variáveis
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` e `TWILIO_NUMBER` no `.env`.
Com elas definidas, o endpoint `/webhook` aceita mensagens do Twilio e responde
com TwiML.

## Comandos

Envie mensagens no WhatsApp com os seguintes textos para interagir com a Lumi:

- `Quero a missão do dia`
- `Quero um desafio`
- `Quem é você?`
- `Qual meu nível?`
`Meu estilo`
- `Desafio em família`
- `Desafio da vida real`
- `Aventura`
- `Charada`
- `Parar`

## Testes

Os testes utilizam Jest. Rode `npm test` para executá-los.

## Configurando o Twilio

Crie um arquivo `.env` baseado em `env.example` e preencha:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`

Para testes no Sandbox do Twilio, use o número fornecido na área de sandbox e adicione os participantes autorizados. Em produção, defina `TWILIO_WHATSAPP_NUMBER` com o número aprovado na sua conta.

## Migração de hospedagem

Caso o serviço apresente instabilidade, é possível executar a aplicação em plataformas como Fly.io ou Railway.

1. Crie um `Dockerfile` simples usando `node:20` e copiando o projeto.
2. Adicione um `Procfile` com `web: node index.js`.
3. Faça o deploy seguindo a documentação da plataforma escolhida.
## Exportação de dados
Preencha `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL` e `GOOGLE_PRIVATE_KEY` no arquivo `.env` para habilitar a exportação para o Google Sheets.
Acesse `/admin/export` para enviar as métricas dos usuários para a aba `Usuarios` da planilha.

## Persistência

Os dados de usuários e filas de desafios são gravados no diretório `/data`. Caso o diretório não exista, ele é criado automaticamente no primeiro uso.

## Healthcheck

O endpoint `/health` responde com `OK` permitindo monitoramento simples da aplicação.

## Google Sheets

Use `/logs/sheets` para consultar as colunas enviadas ao Google Sheets quando exportar métricas.
