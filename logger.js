const fs = require("fs");
const path = require("path");
const multistream = require("pino-multi-stream").multistream;

const createLogger = () => {
  return require("pino")(
    {
      name: "svq",
      level: "info",
    },
    multistream([
      { stream: process.stdout, prettyPrint: false },
      { stream: fs.createWriteStream(path.resolve("svq.log"), { flags: "a" }) },
    ])
  );
};

module.exports = { createLogger };
