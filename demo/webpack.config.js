const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')
 module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, './index.js'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './index.html')
        }),
    ],
 };