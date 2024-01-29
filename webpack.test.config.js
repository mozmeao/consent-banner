/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const path = require('path');
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        test: glob.sync('tests/index.js'),
        'test-deps': ['node_modules/sinon/pkg/sinon.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'tests/dist')
    },
    plugins: [new CleanWebpackPlugin()],
    resolve: {
        modules: [__dirname, 'src', 'node_modules'],
        extensions: ['*', '.js']
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
            }
        ]
    }
};
