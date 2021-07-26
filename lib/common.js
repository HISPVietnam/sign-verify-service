const path = require("path");
const fs = require("fs");

const loadFileDefaults = { encoding: "UTF-8", required: true, isJson: false };

const loadFile = (p, { encoding, required, isJson } = loadFileDefaults) => {
  p = path.resolve(p);

  if (required && !fs.existsSync(p)) {
    throw new Error(`File ${p} does not exist`);
  }

  const data = fs.readFileSync(p, { encoding });

  if (isJson) {
    return JSON.parse(data);
  }

  return data;
};

module.exports = { loadFile };
