const path = require("path");
const fs = require("fs");

const loadFile = (p, opts = {}) => {
  const { encoding, required, isJson } = { encoding: "UTF-8", required: true, isJson: false, ...opts };

  p = path.resolve(p);

  if (required && !fs.existsSync(p)) {
    console.error(`File ${p} does not exist`);
    process.exit(-1);
  }

  const data = fs.readFileSync(p, { encoding });

  if (isJson) {
    return JSON.parse(data);
  }

  return data;
};

module.exports = { loadFile };
