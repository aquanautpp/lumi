export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    plugins: { import: require('eslint-plugin-import') },
    rules: {
      'import/order': ['error', { 'newlines-between': 'always' }],
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
];
