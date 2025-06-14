export default async () => {
  const importPlugin = (await import('eslint-plugin-import')).default;

  return [
    {
      files: ['**/*.js'],
      ignores: ['node_modules/**'],
      languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      plugins: { import: importPlugin },
      rules: {
        'import/order': ['error', { 'newlines-between': 'always' }],
        'no-unused-vars': 'warn',
        'no-console': 'off'
      }
    }
  ];
};
