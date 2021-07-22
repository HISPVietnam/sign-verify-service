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
  const { verify, validator } = request.server.methods;

  try {
    const buffer = await verify(request.payload);
    const data = JSON.parse(buffer.toString("utf-8"));

    const isValid = validator(data);

    if (!isValid) {
      return {
        status: "ERROR",
        data: validator.errors,
      };
    }

    return {
      status: "VERIFIED",
      data,
    };
  } catch (err) {
    return {
      status: "ERROR",
    };
  }
};
