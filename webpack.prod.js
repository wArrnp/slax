const path = require("path");
const TerserJSPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",

  entry: {
    "slax": path.resolve(__dirname, "src/index.js"),
    "slax.min": path.resolve(__dirname, "src/index.js"),
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    publicPath: "/",
    libraryTarget: "umd"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserJSPlugin({
      include: /\.min\.js$/
    })]
  }
}