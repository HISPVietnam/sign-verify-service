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

const Hapi = require("@hapi/hapi");
const Qs = require("qs");

const createServer = async (cfg, security, logger) => {
  const server = new Hapi.server({
    host: cfg.http.host,
    port: cfg.http.port,
    query: {
      parser: query => Qs.parse(query),
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

  if (cfg.signature.enabled) {
    await server.register(require("./routes/signature-api-router"), {
      routes: { prefix: cfg.signature.path },
    });
  }

  if (cfg.httpClient.enabled) {
    await server.register(require("./routes/http-client-api-router"), {
      routes: { prefix: cfg.httpClient.path },
    });
  }

  if (cfg.verification.enabled) {
    await server.register(require("./routes/verification-api-router"), {
      routes: { prefix: cfg.verification.path },
    });
  }

  return server;
};

const startServer = async ({ cfg, security, schemaValidator, logger, httpClient, registry }) => {
  const server = await createServer(cfg, security, logger);

  server.method("cfg", () => cfg);

  if (cfg.signature.enabled) {
    server.method("signature", security.signature);
  }

  if (cfg.httpClient.enabled) {
    server.method("httpClient", httpClient);
  }

  if (cfg.verification.enabled) {
    server.method("verification", security.verification);
  }

  if (cfg.registry.enabled) {
    server.method("registry", registry);
  }

  server.method("validator", schemaValidator);

  await server.start();

  server.log(`Server running on ${server.info.uri}`);

  process.on("unhandledRejection", err => {
    server.log(err);
    process.exit(1);
  });

  process.on("SIGINT", async () => {
    await server.stop({ timeout: 10000 });
    process.exit(0);
  });
};

module.exports = { createServer, startServer };
