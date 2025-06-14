export const google = {
  sheets: () => ({
    spreadsheets: { values: { append: async (opts) => {
      console.log('📊  (MOCK Sheets) append', opts.resource.values);
      return { status: 200 };
    }}}
  })
};
