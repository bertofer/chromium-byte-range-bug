var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path')

module.exports = {
  context: __dirname,
  devtool: debug ? "inline-sourcemap" : null,
  entry: "./src/index.js",
  output: {
    path: __dirname + "./src/",
    filename: "build.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "src"),
    port: 9000
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
