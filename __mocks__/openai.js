export default class OpenAI {
  constructor() {
    this.chat = {
      completions: {
        create: async () => ({ choices: [{ message: { content: 'Ok' } }] })
      }
    };
  }
}
