const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        banner_css: './src/styles.scss',
        demo_js: './demo/main.js',
        demo_css: './demo/main.scss'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'demo/dist/')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        ie: '9'
                                    }
                                }
                            ]
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                outputStyle: 'expanded'
                            }
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        port: 3000,
        open: true,
        watchFiles: [
            'src/**/*.scss',
            'src/**/*.js',
            'demo/**/*.scss',
            'demo/**/*.js',
            'demo/index.html'
        ],
        client: {
            logging: 'error',
            overlay: false
        }
    },
    performance: {
        hints: 'warning'
    },
    optimization: {
        minimize: false
    },
    plugins: [
        // clean out demo/public/dist/ before building
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'demo/index.html')
                },
                {
                    from: path.resolve(__dirname, 'demo/favicon.ico')
                }
            ]
        }),
        new MiniCssExtractPlugin(),
        new RemoveEmptyScriptsPlugin()
    ]
};
