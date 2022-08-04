// This is for "enabling" SharedArrayBuffer

module.exports = function (app) {
  app.use(function (_, res, next) {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
};
