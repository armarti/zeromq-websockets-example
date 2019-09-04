const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;

const commonConfig = {
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            compact: NODE_ENV === 'production'
                        },
                    },
                ]
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
};

const nodeConfig = merge.smart(commonConfig, {
    target: 'node',
    entry: path.join(__dirname, 'index.ts'),
    output: {
        filename: 'out.js',
        path: path.join(__dirname, 'bin')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    'ts-loader'
                ]
            }
        ]
    }
});

const webConfig = merge.smart(commonConfig, {
    target: 'web',
    entry: path.join(__dirname, 'index.ts'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist/static')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'proj-html'
        })
    ]
});

console.debug('nodeConfig = ');
console.debug(nodeConfig);
console.debug('webConfig = ');
console.debug(webConfig);

module.exports = [
    nodeConfig,
    webConfig,
];
