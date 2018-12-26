const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var nodeExternals = require('webpack-node-externals');

module.exports = env => {
  return {
    entry: './app/wireWorld.ts',
    // devtool: 'inline-source-map',
    output: {
      webassemblyModuleFilename: "[modulehash].wasm",
      publicPath: "dist/"
    },
    mode: 'development',
    ...(process.env.WEBPACK_SERVE ? {mode: 'development'} : {}),
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.wasm','.txt'],
      alias: {}
    },
    externals: [{}],
    plugins: [env === 'deploy' && new UglifyJsPlugin()].filter(a => a),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {noEmit: false}
          }
        },
        {
          test: /\.txt/,
          loader: 'raw-loader'
        },
        {
          type: "javascript/auto",
          test: /\.wasm/,
          loaders: ['wasm-loader']
        },
        {
          test: /\.less$/,
          loader: 'less-loader' // compiles Less to CSS
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        },
        {
          test: /\.(gif|svg|jpg|png)$/,
          loader: 'file-loader'
        }]
    }
  };
};
