import runSelfCheck from './selfcheck.js';
import app from './app.js';

try {
  await runSelfCheck();
} catch (err) {
  console.error(err);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

process.on('uncaughtException', err => {
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Lumi listening on port ${PORT}`));
}
