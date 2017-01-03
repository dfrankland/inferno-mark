import { resolve as resolvePath } from 'path';
import { fileSync as tmpFileSync } from 'tmp';
import { buildExternalHelpers } from 'babel-core';
import { writeFileSync } from 'fs';
import babel from 'rollup-plugin-babel';

const { dependencies } = require('./package.json');

// Temporary `babelHelpers` dependency
const { name: tmpFileName } = tmpFileSync();
writeFileSync(
  tmpFileName,
  `
    ${buildExternalHelpers(null, 'var')}
    module.exports = babelHelpers;
  `,
);

export default {
  target: 'web',
  entry: [
    'regenerator-runtime/runtime',
    resolvePath(__dirname, './src/index.js'),
  ],
  output: {
    path: resolvePath(__dirname, './dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        include: resolvePath(__dirname, './src'),
        loader: 'rollup-webpack-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },

  rollupWebpackLoader: {
    rollup: {
      external: [...Object.keys(dependencies)],

      paths: id => {
        if (id.match(/babelHelpers/g) !== null) return tmpFileName;
        return id;
      },

      plugins: [
        babel({
          presets: [
            [
              'env',
              {
                modules: false,
                targets: {
                  browsers: 'last 2 versions, > 5%',
                },
              },
            ],
            'stage-0',
          ],
          plugins: ['external-helpers'],
          babelrc: false,
        }),
      ],
    },
  },
};
