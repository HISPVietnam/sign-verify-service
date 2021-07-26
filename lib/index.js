// Copyright Morten Olav Hansen <morten@winterop.com>, 2021. All Rights Reserved.

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
require("dotenv").config();

const { createLogger } = require("./logger");
const { startServer } = require("./server");
const createSecurity = require("./security");
const createSchemaValidator = require("./schema");
const { enableVerification, enableSigning } = require("./common");

const args = yargs(hideBin(process.argv))
  .usage("Sign-Verify-Service \n\nUsage: $0 [options]")
  .options({
    host: {
      desc: "Hostname",
      type: "string",
      require: true,
      default: process.env["HOST"] || "localhost",
    },
    port: {
      desc: "Port number",
      type: "number",
      require: true,
      default: process.env["PORT"] || 3000,
    },
    schema: {
      desc: "JSON Schema for payload validation",
      type: "string",
      default: process.env["SCHEMA"],
    },
    certificate: {
      desc: "X.509 Certificate",
      type: "string",
      require: enableVerification() || enableSigning(), // we need cert for signing also, not just private key
      default: process.env["CERTIFICATE"],
    },
    "private-key": {
      desc: "Private Key",
      type: "string",
      require: enableSigning(),
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
  schemaValidator: createSchemaValidator(args.schema),
  logger: createLogger({ name: "svs" }),
});
