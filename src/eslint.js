import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import { resolve } from 'import-meta-resolve'
import tsEslint from 'typescript-eslint'

const ERROR = 'error'
const WARN = 'warn'

const has = (/** @type {string} */ pkg) => {
  try {
    resolve(pkg, import.meta.url)
    return true
  } catch {
    return false
  }
}

const hasTypeScript = has('typescript')
const hasReact = has('react')
const hasSvelte = has('svelte')
const hasTestingLibrary = has('@testing-library/dom')
const hasJestDom = has('@testing-library/jest-dom')
const hasVitest = has('vitest')
const vitestFiles = ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*']
const testFiles = ['**/tests/**', '**/#tests/**', ...vitestFiles]
const playwrightFiles = ['**/e2e/**']


const config = [
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintConfigPrettier,
  // all files
  {
    plugins: {
      import: (await import('eslint-plugin-import-x')).default,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unexpected-multiline': ERROR,
      'no-warning-comments': [ERROR, { terms: ['FIXME'], location: 'anywhere' }],
      'import/no-duplicates': [WARN, { 'prefer-inline': true }],
      'import/order': [
        WARN,
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '~*/**', group: 'internal' }],
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
    },
  },
  // Svelte
  hasSvelte
    ? Object.assign({}, ...svelte.configs['flat/recommended'], ...svelte.configs['flat/prettier'], {
        files: ['**/*.svelte'],
        plugins: {
          svelte: (await import('eslint-plugin-svelte')).default,
        },
        languageOptions: {
          parser: tsEslint.parser,
        },
      })
    : null,
  // JSX/TSX files
  hasReact
    ? {
        files: ['**/*.tsx', '**/*.jsx'],
        plugins: {
          react: (await import('eslint-plugin-react')).default,
        },
        languageOptions: {
          parser: tsEslint.parser,
          parserOptions: {
            jsx: true,
          },
        },
        rules: {
          'react/jsx-key': WARN,
        },
      }
    : null,
  // react-hook rules are applicable in ts/js/tsx/jsx, but only with React as a
  // dep
  hasReact
    ? {
        files: ['**/*.ts?(x)', '**/*.js?(x)'],
        plugins: {
          'react-hooks': fixupPluginRules(
            // @ts-expect-error Expected error
            await import('eslint-plugin-react-hooks'),
          ),
        },
        rules: {
          'react-hooks/rules-of-hooks': ERROR,
          'react-hooks/exhaustive-deps': WARN,
        },
      }
    : null,

  // This assumes test files are those which are in the test directory or have
  // *.test.* in the filename. If a file doesn't match this assumption, then it
  // will not be allowed to import test files.
  {
    files: ['**/*.ts?(x)', '**/*.js?(x)'],
    ignores: testFiles,
    rules: {
      'no-restricted-imports': [
        ERROR,
        {
          patterns: [
            {
              group: testFiles,
              message: 'Do not import test files in source files',
            },
          ],
        },
      ],
    },
  },

  // TS and TSX files
  hasTypeScript
    ? {
        files: ['**/*.ts?(x)'],
        plugins: {
          '@typescript-eslint': tsEslint.plugin,
        },
        languageOptions: {
          parser: tsEslint.parser,
          parserOptions: {
            projectService: true,
          },
        },
        rules: {
          '@typescript-eslint/no-unused-vars': [
            WARN,
            {
              args: 'after-used',
              argsIgnorePattern: '^_',
              ignoreRestSiblings: true,
              varsIgnorePattern: '^ignored',
            },
          ],
          'import/consistent-type-specifier-style': [WARN, 'prefer-inline'],
          '@typescript-eslint/consistent-type-imports': [
            WARN,
            {
              prefer: 'type-imports',
              disallowTypeAnnotations: true,
              fixStyle: 'inline-type-imports',
            },
          ],

          '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

          '@typescript-eslint/no-floating-promises': 'error',

          // here are rules we've decided to not enable. Commented out rather
          // than setting them to disabled to avoid them being referenced at all
          // when config resolution happens.

          // @typescript-eslint/require-await - sometimes you really do want
          // async without await to make a function async. TypeScript will ensure
          // it's treated as an async function by consumers and that's enough for me.

          // @typescript-eslint/prefer-promise-reject-errors - sometimes you
          // aren't the one creating the error and, you just want to propagate an
          // error object with an unknown type.

          // @typescript-eslint/only-throw-error - same reason as above.
          // However, this rule supports options to allow you to throw `any` and
          // `unknown`. Unfortunately, in Remix you can throw Response objects
          // and, we don't want to enable this rule for those cases.

          // @typescript-eslint/no-unsafe-declaration-merging - this is a rare
          // enough problem (especially if you focus on types over interfaces)
          // that it's not worth enabling.

          // @typescript-eslint/no-unsafe-enum-comparison - enums are not
          // recommended or used in epic projects, so it's not worth enabling.

          // @typescript-eslint/no-unsafe-unary-minus - this is a rare enough
          // problem that it's not worth enabling.

          // @typescript-eslint/no-base-to-string - this doesn't handle when
          // your object actually does implement toString unless you do so with
          // a class which is not 100% of the time. For example, the timings
          // object in the epic stack uses defineProperty to implement toString.
          // It's not high enough risk/impact to enable.

          // @typescript-eslint/no-non-null-assertion - normally you should not
          // use ! to tell TS to ignore the null case, but you're a responsible
          // adult and if you're going to do that, the linter shouldn't yell at
          // you about it.

          // @typescript-eslint/restrict-template-expressions - toString is a
          // feature of many built-in objects and custom ones. It's not worth
          // enabling.

          // @typescript-eslint/no-confusing-void-expression - what's confusing
          // to one person isn't necessarily confusing to others. Arrow
          // functions that call something that returns void is not confusing
          // and the types will make sure you don't mess something up.

          // these each protect you from `any` and while it's best to avoid
          // using `any`, it's not worth having a lint rule yell at you when you
          // do:
          // - @typescript-eslint/no-unsafe-argument
          // - @typescript-eslint/no-unsafe-call
          // - @typescript-eslint/no-unsafe-member-access
          // - @typescript-eslint/no-unsafe-return
          // - @typescript-eslint/no-unsafe-assignment
        },
      }
    : null,
  // This assumes test files are those which are in the test directory or have
  // *.test.* in the filename. If a file doesn't match this assumption, then it
  // will not be allowed to import test files.
  {
    files: ['**/*.ts?(x)', '**/*.js?(x)'],
    ignores: testFiles,
    rules: {
      'no-restricted-imports': [
        ERROR,
        {
          patterns: [
            {
              group: testFiles,
              message: 'Do not import test files in source files',
            },
          ],
        },
      ],
    },
  },
  hasTestingLibrary
    ? {
        files: testFiles,
        ignores: [...playwrightFiles],
        plugins: {
          // @ts-expect-error Expected error
          'testing-library': (await import('eslint-plugin-testing-library')).default,
        },
        rules: {
          'testing-library/no-unnecessary-act': [ERROR, { isStrict: false }],
          'testing-library/no-wait-for-side-effects': ERROR,
          'testing-library/prefer-find-by': ERROR,
        },
      }
    : null,

  hasJestDom
    ? {
        files: testFiles,
        ignores: [...playwrightFiles],
        plugins: {
          // @ts-expect-error Expected error
          'jest-dom': (await import('eslint-plugin-jest-dom')).default,
        },
        rules: {
          'jest-dom/prefer-checked': ERROR,
          'jest-dom/prefer-enabled-disabled': ERROR,
          'jest-dom/prefer-focus': ERROR,
          'jest-dom/prefer-required': ERROR,
        },
      }
    : null,

  hasVitest
    ? {
        files: testFiles,
        ignores: [...playwrightFiles],
        plugins: {
          vitest: (await import('eslint-plugin-vitest')).default,
        },
        rules: {
          // you don't want the editor to autofix this, but we do want to be
          // made aware of it
          'vitest/no-focused-tests': [WARN, { fixable: false }],
        },
      }
    : null,
  {
    ignores: [
      '**/.wrangler/**',
      '**/.cache/**',
      '**/node_modules/**',
      '**/build/**',
      '**/public/build/**',
      '**/playwright-report/**',
      '**/server-build/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.svelte-kit/**',
      '**/dist/**',
    ],
  },
].filter(Boolean)

export default config
