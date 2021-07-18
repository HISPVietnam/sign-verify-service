const Hapi = require("@hapi/hapi");
const Qs = require("qs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { authenticate } = require("./security");
const { createLogger } = require("./logger");

const logger = createLogger();

async function createServer(host, port) {
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
}

const startServer = async (host, port) => {
  const server = await createServer(host, port);
  await server.start();

  server.log("Server running on %s", server.info.uri);

  process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
  });

  process.on("SIGINT", async () => {
    await server.stop({ timeout: 10000 });
    process.exit(0);
  });
};

const args = yargs(hideBin(process.argv))
  .usage("Sign-Verify-QRCode \n\nUsage: $0 [options]")
  .options({
    host: {
      desc: "Hostname",
      type: "string",
      default: "localhost",
    },
    port: {
      desc: "Port number",
      type: "number",
      default: 3000,
    },
  })
  .parse();

startServer(args.host, args.port);
