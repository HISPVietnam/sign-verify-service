// https://www.npmjs.com/package/ajv
// https://www.npmjs.com/package/ajv-formats

const fs = require("fs");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const defaultSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {},
  additionalProperties: true,
};

const createSchemaValidator = (schema = defaultSchema) => {
  if (typeof schema === "string") {
    schema = JSON.parse(fs.readFileSync(schema, { encoding: "utf-8" }));
  }

  const ajv = new Ajv({
    allErrors: true,
    useDefaults: true,
    validateFormats: "full",
  });

  addFormats(ajv);

  return ajv.compile(schema);
};

module.exports = createSchemaValidator;
