import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // React hooks rules are already enforced by reactHooks plugin
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Enforce naming conventions
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          // Functions exported from hooks directory should start with 'use'
          selector: 'function',
          filter: {
            // This is a best-effort check - full validation in code review
            regex: '.*hooks.*\\.(ts|tsx)$',
          },
          format: ['camelCase'],
          custom: {
            regex: '^(use[A-Z]|use[A-Za-z]+)',
            match: true,
          },
        },
      ],
      
      // Reminder comments for code quality
      'no-warning-comments': [
        'warn',
        {
          terms: ['todo', 'fixme', 'xxx', 'hack', 'zod-required'],
          location: 'anywhere',
        },
      ],
      
      // Note: Zod usage for form validation is enforced via:
      // 1. Code review checklist in CONTRIBUTING.md
      // 2. .cursorrules file (rule #13)
      // 3. Manual review process
      // ESLint cannot reliably detect form validation patterns
    },
  },
])
