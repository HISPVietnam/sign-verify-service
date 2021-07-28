/*
 * Copyright (c) 2021, HISP Vietnam, Co.Ltd
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * Neither the name of the HISP project nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
