/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("prettier-plugin-svelte").PluginConfig} SvelteConfig */

/** @type { PrettierConfig | TailwindConfig | SvelteConfig } */
const config = {
  arrowParens: 'always',
	bracketSameLine: false,
	bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
	insertPragma: false,
	jsxSingleQuote: false,
	printWidth: 100,
	proseWrap: 'always',
	quoteProps: 'as-needed',
	requirePragma: false,
	semi: false,
	singleAttributePerLine: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: false,
  overrides: [
    // formatting the package.json with anything other than spaces will cause
		// issues when running install...
		{
			files: ['**/package.json'],
			options: {
				useTabs: false,
			},
		},
		{
			files: ['**/*.mdx'],
			options: {
				// This stinks, if you don't do this, then an inline component on the
				// end of the line will end up wrapping, then the next save prettier
				// will add an extra line break. Super annoying and probably a bug in
				// prettier, but until it's fixed, this is the best we can do.
				proseWrap: 'preserve',
				htmlWhitespaceSensitivity: 'ignore',
			},
		},
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
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-svelte',
  ],
  tailwindFunctions: ['clsx', 'cva', 'cn'],
  tailwindAttributes: ['class', 'className', 'ngClass', '.*[cC]lassName'],
};

export default config;
