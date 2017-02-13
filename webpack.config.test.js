import { BannerPlugin } from 'webpack';
import { resolve as resolvePath } from 'path';
import webpackConfig from './webpack.config';

const { module } = webpackConfig;
const babelLoaderIndex = module.rules.findIndex(({ loader }) => loader === 'babel-loader');
const babelLoader = module.rules[babelLoaderIndex];
babelLoader.options.plugins = [
  ...babelLoader.options.plugins,
  'istanbul',
];
module.rules[babelLoaderIndex] = babelLoader;

export default [
  {
    ...webpackConfig,
    entry: resolvePath(__dirname, './test/index.js'),
    output: {
      ...webpackConfig.output,
      filename: 'test.js',
    },
    module,
    plugins: [
      new BannerPlugin({
        banner: 'require(\'source-map-support\').install();',
        raw: true,
        entryOnly: true,
      }),
    ],
    node: {
      fs: 'empty',
    },
  },
  webpackConfig,
];
