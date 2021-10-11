const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: 'node',
    externals: [nodeExternals()],
    entry: './src/index.ts',
    devtool: 'source-map',
    mode: "development",
    module: {
        rules: [
            {
                // Include ts, tsx, js, and jsx files.
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'cache-loader',
                        options: {
                            cacheDirectory: path.resolve('.webpackCache')
                        }
                    },
                    'babel-loader'
                ]
            }
        ]
    },
    // plugins
    plugins: [
        // run TSC on a separate thread for faster builds
        new ForkTsCheckerWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' }
            ]
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
};