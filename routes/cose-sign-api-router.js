const Hapi = require("@hapi/hapi");
const { req } = require("pino-std-serializers");
const QRCode = require("qrcode");

const internals = {};

exports.plugin = {
  name: "cose-sign-api-router",
  version: "1.0.0",
  register: async (/** @type Hapi.Server */ server, options) => {
    server.route({
      method: "POST",
      path: "/",
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
  const image = await QRCode.toBuffer(JSON.stringify(request.payload), {
    scale: 10,
    type: "png",
    margin: 2,
  });

  const response = h.response(image);
  response.type("image/png");

  return response;
};
