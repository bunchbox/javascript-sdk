module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
    'plugin:ava/recommended'
  ],
  plugins: ['prettier', 'ava', 'node'],
  env: {
    es6: true,
    node: true
  },
  rules: {
    'ava/use-t-well': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
    'node/no-extraneous-require': 0,
    'node/no-unpublished-require': 0,
    'node/no-unsupported-features': ['error', { ignores: ['modules'] }]
  }
}
