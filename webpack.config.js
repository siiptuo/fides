// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  entry: {
    scales: "./scales.js",
    chords: "./chords.js",
    "euclidean-rhythm": "./euclidean-rhythm/index.js",
    "fibonacci-lfsr": "./fibonacci-lfsr/index.js"
  },
  output: {
    filename: "[contenthash].js",
    path: path.resolve(__dirname, "public")
  },
  devServer: {
    contentBase: "./public"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(png|svg|jpe?g)$/,
        use: [
          {
            loader: "file-loader",
            options: { name: "[contenthash:20].[ext]" }
          },
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                quality: 50
              }
            }
          }
        ]
      },
      {
        test: /\.ico$/,
        use: [
          {
            loader: "file-loader",
            options: { name: "[contenthash:20].[ext]" }
          }
        ]
      },
      {
        test: /\.wav$/,
        use: [
          {
            loader: "./ffmpeg-loader.js",
            options: {
              name: "[contenthash:20].[ext]",
              formats: {
                wav: ["-ac", "1", "-c", "pcm_s16le", "-f", "wav"],
                webm: ["-ac", "1", "-c", "libvorbis", "-f", "webm"],
                m4a: [
                  "-ac",
                  "1",
                  "-c",
                  "aac",
                  "-movflags",
                  "empty_moov",
                  "-f",
                  "mp4"
                ]
              }
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
      filename: "index.html"
    }),
    new HtmlWebpackPlugin({
      template: "scales.html",
      filename: "scales.html",
      chunks: ["scales"]
    }),
    new HtmlWebpackPlugin({
      template: "chords.html",
      filename: "chords.html",
      chunks: ["chords"]
    }),
    new HtmlWebpackPlugin({
      template: "euclidean-rhythm/index.html",
      filename: "euclidean-rhythm.html",
      chunks: ["euclidean-rhythm"]
    }),
    new HtmlWebpackPlugin({
      template: "fibonacci-lfsr/index.html",
      filename: "fibonacci-lfsr.html",
      chunks: ["fibonacci-lfsr"]
    }),
    new MiniCssExtractPlugin({ filename: "[contenthash].css" })
  ]
};
