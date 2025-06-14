export default function () {
  return { messages: { create: async (opts) => {
    console.log('💬  (MOCK Twilio) →', opts.to, '|', opts.body);
    return { sid: 'SM_mock' };
  }}};
}
