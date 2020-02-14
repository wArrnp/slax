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
          loader: 'babel-loader',
          options: {
            "presets": ["@babel/preset-env", "@babel/preset-react"],
            "plugins": ["@babel/plugin-proposal-class-properties"]
          }
        }
      }
    ]
  },

  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        "absoluteRuntime": false,
        "corejs": 3, 
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ],

  optimization: {
    minimize: true,
    minimizer: [new TerserJSPlugin({
      include: /\.min\.js$/
    })]
  }
}