module.exports = {
  chat: { completions: { create: async () => ({
    choices: [{ message: { content: '[RESPOSTA MOCKADA DA LUMI]' } }]
  }) } }
};
