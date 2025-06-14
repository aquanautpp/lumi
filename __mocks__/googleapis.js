export const google = {
  auth: { JWT: class {} },
  sheets: () => ({
    spreadsheets: { values: { update: async (opts) => {
      console.log('📊  (MOCK Sheets) append', opts.requestBody.values);
      return { status: 200 };
    }}}
  })
};
