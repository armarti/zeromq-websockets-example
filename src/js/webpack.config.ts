require('ts-node/register');
import webpack from 'webpack';
import path from 'path';
import webpackMerge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// const electronRendererDefaultConfig = require('electron-webpack/webpack.renderer.config');
// const electronMainDefaultConfig = require('electron-webpack/webpack.main.config');
// const electronDllDefaultConfig = require('electron-webpack/webpack.renderer.dll.config');
// import { inspect } from 'util';
// import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

let NODE_ENV: webpack.Configuration['mode'];
if(~['development', 'production', 'none'].indexOf(process.env.NODE_ENV || '')) {
    NODE_ENV = <webpack.Configuration['mode']>process.env.NODE_ENV;
} else {
    NODE_ENV = 'production';
}
const IS_PRODUCTION: boolean = NODE_ENV === 'production';
const JS_WORKSPACE_ROOT: string = __dirname;  // path.resolve(__dirname);

const commonConfig = (includeNodeModules: boolean): webpack.Configuration => {
    // let configFile = path.isAbsolute(tsConfigPath) ?
    //                  tsConfigPath :
    //                  path.resolve(path.join(JS_WORKSPACE_ROOT, tsConfigPath));
    return {
        mode: NODE_ENV,
        devtool: IS_PRODUCTION ? 'source-map' : 'cheap-module-eval-source-map',
        optimization: {
            minimize: IS_PRODUCTION
        },
        module: {
            rules: [
                {
                    test: /\.[tj]sx?$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            query: {
                                compact: IS_PRODUCTION
                            },
                        },
                    ]
                },
                {
                    test: /\.tsx?$/,
                    ...(includeNodeModules ? {} : { exclude: /node_modules/ }),
                    loader: 'ts-loader',
                    // options: { configFile: tsConfigPath }
                },
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
            // plugins: [
            //     new TsconfigPathsPlugin({
            //         configFile: tsConfigPath,
            //         logLevel: 'info',
            //     }),
            // ]
        },
    }
};

/*const webConfig = webpackMerge.smart(commonConfig(true, './misc/tsconfig.json'), {
    target: 'web',
    entry: path.join(JS_WORKSPACE_ROOT, 'misc/index.ts'),
    output: {
        filename: 'bundle.js',
        path: path.join(JS_WORKSPACE_ROOT, './dist/static')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'proj-html'
        })
    ]
});

const nodeConfig = webpackMerge.smart(commonConfig(false, './misc/tsconfig.json'), {
    target: 'node',
    entry: path.join(JS_WORKSPACE_ROOT, 'index.ts'),
    output: {
        filename: 'out.js',
        path: path.join(JS_WORKSPACE_ROOT, './dist/bin')
    }
});*/

const electronMainConfig = webpackMerge.smart(commonConfig(false /*, 'tsconfig.json'*/), {
    context: path.join(JS_WORKSPACE_ROOT, './app/main'),
    target: 'electron-main',
    entry: './index.ts',
    output: {
        filename: 'main.js',
        path: path.join(JS_WORKSPACE_ROOT, './build/app')
    }
});

const electronRendererConfig = webpackMerge.smart(commonConfig(false /*, 'tsconfig.json'*/), {
    context: path.join(JS_WORKSPACE_ROOT, './app/renderer'),
    target: 'electron-renderer',
    entry: './index.tsx',
    output: {
        filename: 'index.js',
        path: path.join(JS_WORKSPACE_ROOT, './build/app/renderer')
    },
    plugins: [
        new HtmlWebpackPlugin({
            // minify: IS_PRODUCTION,
            template: path.join(JS_WORKSPACE_ROOT, './app/renderer/index.ejs'),
            inject: false,
            templateParameters: (
                    compilation: webpack.compilation.Compilation,
                    assets: HtmlWebpackPlugin.TemplateParametersAssets,
                    options: HtmlWebpackPlugin.Options
            ) => {
                return {
                    title: 'Document title',
                    files: assets,
                    options: options,
                    webpack: compilation.getStats().toJson(),
                };
            }
        })
    ]
});

// const electronDllConfig = electronDllDefaultConfig;
// const electronDllConfig = env => {
//     return new Promise((resolve, reject) => {
//         electronDllDefaultConfig(env).then(dllConfig => {
//             const modConfig = webpackMerge.smart(
//                 commonConfig(false),
//                 dllConfig,
//                 {
//                     entry: path.join(JS_WORKSPACE_ROOT, 'app/renderer/index.tsx'),
//                     output: {
//                         // filename: 'bundle.js',
//                         path: path.join(JS_WORKSPACE_ROOT, 'dist/app')
//                     }
//                 },
//             );
//             resolve(modConfig);
//         })
//     })
// };

// const electronRendererConfig = electronRendererDefaultConfig;
// const electronRendererConfig = env => {
//     return new Promise((resolve, reject) => {
//         electronRendererDefaultConfig(env).then(rendererConfig => {
//             const modConfig = webpackMerge(
//                 rendererConfig,
//                 // commonConfig(false),
//                 {
//                     // entry: {
//                     //     renderer: [
//                     //         path.join(JS_WORKSPACE_ROOT, 'app/renderer/index.tsx')
//                     //     ]
//                     // },
//                     output: {
//                         // filename: 'bundle.js',
//                         path: path.join(JS_WORKSPACE_ROOT, 'dist/app')
//                     }
//                 },
//             );
//             resolve(modConfig);
//         })
//     })
// };

// const electronMainConfig = electronMainDefaultConfig;
// const electronMainConfig = env => {
//     return new Promise((resolve, reject) => {
//         electronMainDefaultConfig(env).then(mainConfig => {
//             const modConfig = webpackMerge.smart(
//                 commonConfig(false),
//                 mainConfig,
//                 {
//                     entry: path.join(JS_WORKSPACE_ROOT, 'app/main/index.ts'),
//                     output: {
//                         // filename: 'bundle.js',
//                         path: path.join(JS_WORKSPACE_ROOT, 'dist/app')
//                     }
//                 },
//             );
//             resolve(modConfig);
//         })
//     })
// };

// console.log('\nwebConfig = ', inspect(webConfig, {
//     showHidden: false,
//     depth: null,
//     colors: true
// }));

// console.log('\nnodeConfig = ', inspect(nodeConfig, {
//     showHidden: false,
//     depth: null,
//     colors: true
// }));

// electronDllDefaultConfig().then(config => {
//     console.log('\nelectronDllDefaultConfig = ', inspect(config, {
//         showHidden: false,
//         depth: null,
//         colors: true
//     }));
// });

// electronDllConfig().then(config => {
//     console.log('\nelectronDllConfig = ', inspect(config, {
//         showHidden: false,
//         depth: null,
//         colors: true
//     }));
// });

// electronRendererDefaultConfig().then(config => {
//     console.log('\nelectronRendererDefaultConfig = ', inspect(config, {
//         showHidden: false,
//         depth: null,
//         colors: true
//     }));
// });

// electronRendererConfig().then(config => {
//     console.log('\nelectronRendererConfig = ', inspect(config, {
//         showHidden: false,
//         depth: null,
//         colors: true
//     }));
// });

// electronMainDefaultConfig().then(config => {
//     console.log('\nelectronMainDefaultConfig = ', inspect(config, {
//         showHidden: false,
//         depth: null,
//         colors: true
//     }));
// });

// electronMainConfig().then(config => {
//     console.log('\nelectronMainConfig = ', inspect(config, {
//         showHidden: false,
//         depth: null,
//         colors: true
//     }));
// });

module.exports = [
    // electronDllConfig,
    electronRendererConfig,
    electronMainConfig,
    // webConfig,
    // nodeConfig,
];
