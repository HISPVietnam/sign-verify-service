const Hapi = require("@hapi/hapi");
const Qs = require("qs");

const createServer = async (host, port, security, logger) => {
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

  server.auth.strategy("basic", "basic", { validate: security.authenticate });

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

const startServer = async ({ port, host, security, logger }) => {
  const server = await createServer(host, port, security, logger);

  server.method("sign", security.sign);
  server.method("verify", security.verify);

  await server.start();

  server.log(`Server running on ${server.info.uri}`);

  process.on("unhandledRejection", (err) => {
    server.log(err);
    process.exit(1);
  });

  process.on("SIGINT", async () => {
    await server.stop({ timeout: 10000 });
    process.exit(0);
  });
};

module.exports = { createServer, startServer };