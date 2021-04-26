const path = require('path');

module.exports = function override(config, env) {
  const wasmExtensionRegExp = /\.wasm$/;
  const binExtensionRegExp = /\.bin$/;

  config.resolve.extensions.push('.wasm');
  config.resolve.extensions.push('.bin');

  config.module.rules.forEach((rule) => {
    (rule.oneOf || []).forEach((oneOf) => {
      if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
        // make file-loader ignore WASM files and bin files
        oneOf.exclude.push(wasmExtensionRegExp);
        oneOf.exclude.push(binExtensionRegExp);
      }
      if (oneOf.loader && oneOf.loader.indexOf('url-loader') >= 0) {
        // make url-loader ignore WASM files and bin files
        let toExclude = [binExtensionRegExp, wasmExtensionRegExp];
        oneOf.exclude = toExclude;
      }
    });
  });

  // add a dedicated loader for WASM
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, 'src'),
    use: [{ loader: require.resolve('wasm-loader'), options: {} }],
  });

  // add a dedicated loader for binary files
  config.module.rules.push({
    test: binExtensionRegExp,
    include: path.resolve(__dirname, 'src'),
    use: [
      {
        loader: require.resolve('binary-loader'),
        options: {},
      },
    ],
  });
  config.node = {
    __filename: true,
    __dirname: true,
  };
  return config;
};
