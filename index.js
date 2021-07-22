const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { createLogger } = require("./logger");
const { startServer } = require("./server");
const createSecurity = require("./security");

require("dotenv").config();

const args = yargs(hideBin(process.argv))
  .usage("Sign-Verify-Service \n\nUsage: $0 [options]")
  .options({
    host: {
      desc: "Hostname",
      type: "string",
      default: process.env["HOST"] || "localhost",
    },
    port: {
      desc: "Port number",
      type: "number",
      default: process.env["PORT"] || 3000,
    },
    certificate: {
      desc: "X.509 Certificate",
      type: "string",
      default: process.env["CERTIFICATE"],
    },
    "private-key": {
      desc: "Private Key",
      type: "string",
      default: process.env["PRIVATE_KEY"],
    },
    username: {
      desc: "Username for basic HTTP access",
      type: "string",
      default: process.env["USERNAME"] || "admin",
    },
    password: {
      desc: "Password for basic HTTP access",
      type: "string",
      default: process.env["PASSWORD"] || "admin",
    },
  })
  .parse();

startServer({
  host: args.host,
  port: args.port,
  security: createSecurity(args.username, args.password, args.certificate, args.privateKey),
  logger: createLogger({ name: "svs" }),
});
