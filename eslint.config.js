import defaultConfig from './src/eslint.js'

export default [
  {
    ignores: ['dist/**/*'],
  },
  ...defaultConfig,
]
