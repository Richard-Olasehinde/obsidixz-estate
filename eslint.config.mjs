import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Flat ESLint configuration.
 * `eslint-config-next` v16 ships native flat configs, so no FlatCompat shim is used.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'public/**', 'scripts/**'],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
