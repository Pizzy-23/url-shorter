const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  plugins: [
    new TsconfigPathsPlugin({
      configFile: './tsconfig.json',
    }),
  ],
};
