module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-prototype-builtins': ['off'],
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
}
