const fs = require("fs");
const path = require("path");
const multistream = require("pino-multi-stream").multistream;

const createLogger = () => {
  return require("pino")(
    {
      name: "svs",
      level: "info",
    },
    multistream([
      { stream: process.stdout, prettyPrint: false },
      { stream: fs.createWriteStream(path.resolve("svs.log"), { flags: "a" }) },
    ])
  );
};

module.exports = { createLogger };
