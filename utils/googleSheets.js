import { google } from 'googleapis';

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !key) {
    throw new Error('Credenciais do Google não configuradas');
  }
  return new google.auth.JWT(email, null, key, [
    'https://www.googleapis.com/auth/spreadsheets'
  ]);
}

export async function atualizarSheet(spreadsheetId, range, values) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}
