const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const path = require('path');
const version = require('./package.json').version;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js',
        styles: './src/styles.scss'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'MozConsentBanner',
            type: 'umd'
        }
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
    performance: {
        hints: 'warning'
    },
    optimization: {
        minimize: false
    },
    plugins: [
        // clean out dist/ before building
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/package/package.json'),
                    transform: function (content) {
                        return JSON.stringify(
                            JSON.parse(content, (key, value) =>
                                key === 'version' ? version : value
                            ),
                            null,
                            4
                        );
                    }
                },
                {
                    from: path.resolve(
                        __dirname,
                        'node_modules/@mozilla-protocol/tokens/dist/index.scss'
                    ),
                    to: 'tokens/'
                },
                {
                    from: path.resolve(__dirname, 'src/styles.scss'),
                    transform: (content) => {
                        // This is required so that styles.scss can load the tokens library
                        // using a relative @import, as opposed to requiring package to be
                        // installed as a peer dependency by every client.
                        return content
                            .toString()
                            .replace(
                                '~@mozilla-protocol/tokens/dist/index',
                                'tokens/index'
                            );
                    }
                },
                {
                    from: path.resolve(__dirname, 'README.md')
                },
                {
                    from: path.resolve(__dirname, 'LICENSE')
                }
            ]
        }),
        new MiniCssExtractPlugin(),
        new RemoveEmptyScriptsPlugin()
    ]
};
