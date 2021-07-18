const Hapi = require("@hapi/hapi");
const Qs = require("qs");
const { authenticate } = require("./security");

const createServer = async (host, port, logger) => {
  const server = new Hapi.server({
    port,
    host,
    query: {
      parser: (query) => Qs.parse(query),
    },
  });

  await server.register(require("@hapi/inert"));
  await server.register(require("@hapi/basic"));
  await server.register(require("@hapi/vision"));

  await server.register({
    // pino for logging (use pino-pretty for colored output)
    plugin: require("hapi-pino"),
    options: {
      instance: logger,
      redact: ["req.headers.authorization"],
    },
  });

  server.auth.strategy("basic", "basic", { validate: authenticate });

  server.views({
    engines: {
      ejs: require("ejs"),
    },
    relativeTo: __dirname,
    path: "views",
    isCached: false,
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return h.view("index", {});
    },
  });

  await server.register(require("./routes/sign-api-router"), {
    routes: { prefix: "/certificate/sign" },
  });

  await server.register(require("./routes/verify-api-router"), {
    routes: { prefix: "/certificate/verify" },
  });

  return server;
};

module.exports = { createServer };
