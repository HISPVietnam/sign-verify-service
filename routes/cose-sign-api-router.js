const Hapi = require("@hapi/hapi");

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

internals.handler = async (request, h) => {
  return {
    status: "OK",
  };
};
