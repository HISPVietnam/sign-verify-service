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

const { defaultsDeep } = require("lodash");
const { loadFile, loadModule, isFunction } = require("./common");

const defaultConfig = {
  http: {
    host: "localhost",
    port: 3000,
    auth: [
      {
        username: "admin",
        password: "admin",
      },
    ],
  },
  logging: {
    enabled: true,
    name: "svs",
  },
  schema: undefined,
  keys: { public: undefined, private: undefined },
  signature: {
    enabled: true,
    path: "/sign",
    qrCode: {
      version: undefined,
      scale: 4,
      type: "png",
      margin: 2,
      errorCorrectionLevel: "quartile",
      quality: 0.92,
      deflateLevel: 9,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    },
  },
  verification: { enabled: true, path: "/verify" },
  httpClient: {
    enabled: false,
    path: "/httpClient",
    baseUrl: undefined,
    module: undefined,
    auth: {
      // only basic auth currently supported
      username: undefined,
      password: undefined,
    },
  },
};

let config;

const parse = cfg => {
  if (cfg.schema) {
    cfg.schema = loadFile(cfg.schema, { isJson: true });
  }

  if (cfg.keys.public) {
    cfg.keys.public = loadFile(cfg.keys.public);
  }

  if (cfg.signature.enabled && cfg.keys.private) {
    cfg.keys.private = loadFile(cfg.keys.private);
  }

  if (cfg.httpClient.enabled) {
    if (!cfg.httpClient.module) {
      throw new Error("When httpClient.enabled = true, httpClient.module is required.");
    }

    cfg.httpClient.module = loadModule(cfg.httpClient.module);

    if (!isFunction(cfg.httpClient.module)) {
      throw new Error("httpClient.module should be a CommonJS module and only return one method.");
    }
  }

  return cfg;
};

module.exports = configFile => {
  if (config) {
    return config;
  }

  config = parse(defaultsDeep({}, loadFile(configFile, { isYaml: true }), defaultConfig));

  return config;
};
