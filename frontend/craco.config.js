// frontend/craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "assert": require.resolve("assert"),
        "zlib": require.resolve("browserify-zlib"),
        "util": require.resolve("util"),
        "url": require.resolve("url"),
        "http2": false
      };
      return webpackConfig;
    }
  }
};