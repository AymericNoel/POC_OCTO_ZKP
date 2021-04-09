module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'linebreak-style': ["error", "windows"],
    'react/prefer-stateless-function': [1, { "ignorePureComponents": true }],
    'react/jsx-filename-extension': [1, { "extensions": [".js", ".jsx"] }],
    'react/jsx-no-bind':[1],
    'react/prop-types':"off",
    'react/destructuring-assignment':"off",
    'react/no-access-state-in-setstate':"off",
    'no-sequences': ["error", { "allowInParentheses": false }],
    'react/jsx-one-expression-per-line':"off",
    'jsx-quotes':"off",
    'quotes':"off",
    'no-console': ["off", { allow: ["warn", "error"] }],
    'import/no-extraneous-dependencies':"off",
    'object-curly-newline': "off", 
  },
};
