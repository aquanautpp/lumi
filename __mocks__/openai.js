export default {
  chat: { completions: { create: async () => ({
    choices: [{ message: { content: '[MOCK-OPENAI]' } }]
  }) } }
};
