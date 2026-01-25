// apps/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"], // Expo default [web:362][web:367]
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
          alias: {
            "@": "./src",
          },
        },
      ],
    ],
  };
};
