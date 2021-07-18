const Hapi = require("@hapi/hapi");
const QRCode = require("qrcode");
const { coseSign } = require("../security");

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
  const buf = await coseSign(JSON.stringify(request.payload));

  const image = await QRCode.toBuffer(buf.toString("hex"), {
    scale: 4,
    type: "png",
    margin: 2,
  });

  const response = h.response(image);
  response.type("image/png");

  return response;
};
