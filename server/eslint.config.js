// eslint.config.js
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser
    },
    plugins: {
      '@typescript-eslint': eslintPlugin
    },
    rules: {
      // Spread in the recommended rules from the plugin
      ...eslintPlugin.configs.recommended.rules,
      // Add or override your own custom rules
    }
  }
];
