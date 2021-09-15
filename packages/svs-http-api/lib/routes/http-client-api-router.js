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
const QRCode = require("qrcode");
const getPath = require("lodash.get");

const internals = {};

exports.plugin = {
  name: "http-client-api-router",
  desc: "API to fetch payload from a remote http url, transform, then sign",
  version: "1.0.0",
  register: async (/** @type Hapi.Server */ server, options) => {
    server.route({
      method: "GET",
      path: "/",
      options: {
        auth: {
          strategies: ["basic"],
          mode: "required",
        },
      },
      handler: internals.handler,
    });
  },
};

/**
 * @param {Hapi.Request} request
 * @param {Hapi.ResponseToolkit} h
 * @returns
 */
internals.handler = async (request, h) => {
  const { signature, validator, httpClient, cfg } = request.server.methods;
  const { qrCode } = cfg().signature;

  const payload = await httpClient(request);

  if (!payload) {
    return {
      status: "ERROR",
      data: {},
    };
  }

  const isValid = validator(payload);

  if (!isValid) {
    return {
      status: "ERROR",
      data: validator.errors,
    };
  }

  const buffer = await signature(JSON.stringify(payload));

  const image = await QRCode.toBuffer(buffer.toString("hex"), {
    version: qrCode.version,
    scale: qrCode.scale,
    type: "png",
    margin: qrCode.margin,
    errorCorrectionLevel: qrCode.errorCorrectionLevel,
    quality: qrCode.quality,
    deflateLevel: qrCode.deflateLevel,
    color: {
      dark: qrCode.color.dark,
      light: qrCode.color.light,
    },
  });

  const response = h.response(image);
  response.type("image/png");

  if (cfg().registry.enabled) {
    const key = getPath(payload, cfg().registry.key);
    request.server.methods.registry(key, {
      id: key,
      created_at: new Date().toISOString(),
      username: request.auth.credentials.username,
      ip: request.info.remoteAddress,
      revoked: false,
      signature: buffer.toString("hex"),
    });
  }

  return response;
};
