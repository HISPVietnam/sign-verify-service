const Bcrypt = require("bcrypt");
const cose = require("cose-js");

const hashPassword = (pw) => {
  return Bcrypt.hashSync(pw, Bcrypt.genSaltSync(10));
};

const authenticate = (username, password) => {
  // for now we just check that username==password
  const userPassword = hashPassword(username);

  return {
    isValid: Bcrypt.compareSync(password, userPassword),
    valid: Bcrypt.compareSync(password, userPassword),
    credentials: { username, password },
  };
};

const coseSign = async (payload) => {
  const headers = {
    p: { alg: "ES256" },
    u: { kid: "11" },
  };

  const signer = {
    key: {
      d: Buffer.from("6c1382765aec5358f117733d281c1c7bdc39884d04a45a1e6c67c858bc206c19", "hex"),
    },
  };

  return cose.sign.create(headers, payload, signer);
};

const coseVerify = (payload) => {
  const verifier = {
    key: {
      x: Buffer.from("143329cce7868e416927599cf65a34f3ce2ffda55a7eca69ed8919a394d42f0f", "hex"),
      y: Buffer.from("60f7f1a780d8a783bfb7a2dd6b2796e8128dbbcef9d3d168db9529971a36e7b9", "hex"),
    },
  };

  const COSEMessage = Buffer.from(payload, "hex");

  return cose.sign.verify(COSEMessage, verifier);
};

module.exports = { hashPassword, authenticate, coseSign, coseVerify };
