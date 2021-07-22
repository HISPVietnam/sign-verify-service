const Hapi = require("@hapi/hapi");

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
  const { verify } = request.server.methods;

  try {
    const buf = await verify(request.payload);

    return {
      status: "VERIFIED",
      data: JSON.parse(buf.toString("utf-8")),
    };
  } catch (err) {
    return {
      status: "ERROR",
    };
  }
};
