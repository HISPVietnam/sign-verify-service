const fs = require("fs");
const path = require("path");
const multistream = require("pino-multi-stream").multistream;

const createLogger = ({ name }) => {
  return require("pino")(
    {
      name,
      level: "info",
    },
    multistream([
      { stream: process.stdout, prettyPrint: false },
      { stream: fs.createWriteStream(path.resolve(`${name}.log`), { flags: "a" }) },
    ])
  );
};

module.exports = { createLogger };
