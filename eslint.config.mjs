import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**', 'android/**', 'ios/**'] },
  { files: ['**/*.{ts,tsx}'], languageOptions: { parser: tseslint.parser },
    plugins: { '@typescript-eslint': tseslint.plugin, 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      // TypeScript owns symbol resolution and unused declarations.
      'no-undef': 'off', 'no-unused-vars': 'off', 'no-redeclare': 'off',
      'no-irregular-whitespace': ['error', { skipRegExps: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
