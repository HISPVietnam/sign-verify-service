const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { createLogger } = require("./logger");
const { createServer } = require("./server");

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
  .usage("Sign-Verify-Service \n\nUsage: $0 [options]")
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

startServer(args.host, args.port, createLogger());
