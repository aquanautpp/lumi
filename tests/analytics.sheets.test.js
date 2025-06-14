import { jest } from '@jest/globals';
import { exportarParaGoogleSheets } from '../utils/analytics.js';

test('Exporta para Google Sheets (mock)', async () => {
  process.env.GOOGLE_SHEETS_ID = 'test';
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'x@y.com';
  process.env.GOOGLE_PRIVATE_KEY = 'k';
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  await exportarParaGoogleSheets();
  expect(log.mock.calls[0][0]).toContain('(MOCK Sheets) append');
  log.mockRestore();
});
