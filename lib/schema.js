// Copyright Morten Olav Hansen <morten@winterop.com>, 2021. All Rights Reserved.

// https://www.npmjs.com/package/ajv
// https://www.npmjs.com/package/ajv-formats

const fs = require("fs");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const { loadFile } = require("./common");

const defaultSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {},
  additionalProperties: true,
};

const createSchemaValidator = (schema = defaultSchema) => {
  if (typeof schema === "string") {
    schema = loadFile(schema, { isJson: true });
  }

  const ajv = new Ajv2020({
    allErrors: true,
    useDefaults: true,
    strict: false,
    validateFormats: "full",
  });

  addFormats(ajv);

  return ajv.compile(schema);
};

module.exports = createSchemaValidator;
