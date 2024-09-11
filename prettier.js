import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("prettier-plugin-svelte").PluginConfig} SvelteConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig | SvelteConfig } */
const config = {
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-svelte',
    '@ianvs/prettier-plugin-sort-imports',
  ],
  tailwindConfig: path.join(__dirname, 'tailwind.config.ts'),
  tailwindFunctions: ['clsx', 'cva', 'cn'],
  importOrder: [
    '<TYPES>',
    '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '<TYPES>^@repo',
    '^@repo/(.*)$',
    '',
    '<TYPES>^[.|..|~]',
    '^~/',
    '^[../]',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '4.4.0',
  useTabs: false,
  singleQuote: true,
  printWidth: 100,
  overrides: [
    {
      files: '*.json.hbs',
      options: {
        parser: 'json',
      },
    },
    {
      files: '*.js.hbs',
      options: {
        parser: 'babel',
      },
    },
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
  ],
};

export default config;
