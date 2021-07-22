const Hapi = require("@hapi/hapi");
const QRCode = require("qrcode");

const internals = {};

exports.plugin = {
  name: "cose-sign-api-router",
  version: "1.0.0",
  register: async (/** @type Hapi.Server */ server, options) => {
    server.route({
      method: "POST",
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
  const { sign, validator } = request.server.methods;

  const isValid = validator(request.payload);

  if (!isValid) {
    return {
      status: "ERROR",
      data: validator.errors,
    };
  }

  const buffer = await sign(JSON.stringify(request.payload));

  const image = await QRCode.toBuffer(buffer.toString("hex"), {
    scale: 4,
    type: "image/png",
    margin: 3,
    errorCorrectionLevel: "quartile",
  });

  const response = h.response(image);
  response.type("image/png");

  return response;
};