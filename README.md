# Lumi

Lumi é um bot que integra a API WhatsApp Business e diversos serviços para enviar desafios e mensagens personalizadas. O projeto é escrito em Node.js e utiliza Jest para os testes automatizados.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `env.example` para `.env` e edite com suas credenciais:
   ```bash
   cp env.example .env
   ```
   Preencha as seguintes variáveis no `.env`:
   - `OPENAI_API_KEY` &ndash; chave de acesso à API da OpenAI.
   - `WHATSAPP_TOKEN` &ndash; token gerado no WhatsApp Business Cloud API.
   - `FROM_PHONE_ID` ou `PHONE_ID` &ndash; identificador do telefone registrado na Meta.
   - `VERIFY_TOKEN` &ndash; token que será utilizado na validação do webhook.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` &ndash; credenciais do Cloudinary para o envio de relatórios.
   - `PORT` &ndash; porta em que o servidor será iniciado (padrão `3000`).
   - `JSON_PATH` &ndash; caminho para o arquivo de memória usado pela aplicação.

> „É necessário configurar um webhook no WhatsApp Business apontando para `http(s)://SEU_HOST/webhook` utilizando o `VERIFY_TOKEN` definido acima. Sem esse passo o aplicativo não receberá as mensagens do WhatsApp.”

## Execução do servidor

Após configurar o `.env` e instalar as dependências, execute:

```bash
npm start
```

O servidor será iniciado na porta definida em `PORT`.

## Testes

Execute todos os testes com:

```bash
npm test
```

Os testes são escritos usando Jest e estão localizados no diretório `tests`.
