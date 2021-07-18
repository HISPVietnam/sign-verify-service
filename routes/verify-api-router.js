const Hapi = require("@hapi/hapi");
const { coseVerify } = require("../security");

const internals = {};

exports.plugin = {
  name: "cose-verify-api-router",
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
  try {
    const buf = await coseVerify(request.payload);

    return {
      status: "OK",
      data: JSON.parse(buf.toString("utf-8")),
    };
  } catch (err) {
    return {
      status: "ERROR",
    };
  }
};
