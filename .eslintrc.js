module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  parser: "babel-eslint",
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb',
  ],
  plugins: [
    'react',
  ],
  rules: {
    'linebreak-style': ["error", (process.platform === "win32" ? "windows" : "unix")],
    'react/prefer-stateless-function': [1, { "ignorePureComponents": true }],
    'react/jsx-filename-extension': [1, { "extensions": [".js", ".jsx"] }],
    'react/jsx-no-bind': [1],
    'react/prop-types': "off",
    'react/destructuring-assignment': "off",
    'react/no-access-state-in-setstate': "off",
    'no-sequences': ["error", { "allowInParentheses": false }],
    'react/jsx-one-expression-per-line': "off",
    'jsx-quotes': "off",
    'quotes': "off",
    'import/no-extraneous-dependencies': "off",
    'object-curly-newline': "off",
    'react/jsx-props-no-spreading': [1, {"custom": "ignore"}]
  },
};
