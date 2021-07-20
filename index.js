const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { createLogger } = require("./logger");
const { startServer } = require("./server");

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

startServer({ host: args.host, port: args.port, logger: createLogger({ name: "svs" }) });
