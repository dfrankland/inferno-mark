import { resolve as resolvePath } from 'path';

export default {
  entry: resolvePath(__dirname, './src/index.js'),

  output: {
    path: resolvePath(__dirname, './dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: resolvePath(__dirname, './src'),
        loader: 'babel-loader',
        options: {
          presets: [
            [
              'env',
              {
                modules: false,
                targets: {
                  browsers: 'last 1 versions',
                  node: 4,
                },
              },
            ],
            'stage-0',
          ],
          plugins: ['transform-runtime'],
          babelrc: false,
        },
      },
    ],
  },

  devtool: 'source-map',
};
