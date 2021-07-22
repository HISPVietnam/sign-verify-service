const Bcrypt = require("bcrypt");
const fs = require("fs");
const cose = require("cose-js");
const cbor = require("cbor");
const zlib = require("zlib");
const createHash = require("crypto").createHash;
const { Certificate, PrivateKey } = require("@fidm/x509");
const base45 = require("base45-js");

const hashPassword = (pw) => {
  return Bcrypt.hashSync(pw, Bcrypt.genSaltSync(10));
};

const authenticate = (localUsername, localPassword, request, username, password) => {
  const valid = localUsername == username && Bcrypt.compareSync(password, localPassword);

  return {
    isValid: valid,
    valid,
    credentials: { username, password },
  };
};

const coseSign = async (data, certificate, privateKey) => {
  const headers = {
    p: { alg: "ES256", kid: createFingerprint(certificate) },
    u: {},
  };

  // Highly ES256 specific - extract the 'D' for signing.
  const keyD = Buffer.from(privateKey.keyRaw.slice(7, 7 + 32));
  const plaintext = cbor.encode(data);

  const signer = {
    key: {
      d: keyD,
    },
  };

  return cose.sign.create(headers, plaintext, signer).then((buf) => {
    buf = zlib.deflateSync(buf);
    buf = "HC1:" + base45.encode(buf);

    return buf;
  });
};

const coseVerify = (data, certificate) => {
  if (data.startsWith("HC1")) {
    data = data.substring(3);
    if (data.startsWith(":")) {
      data = data.substring(1);
    } else {
      console.log("Warning: unsafe HC1: header - update to v0.0.4");
    }
  } else {
    console.log("Warning: no HC1: header - update to v0.0.4");
  }

  data = base45.decode(data);
  data = zlib.inflateSync(data);

  const publicKey = certificate.publicKey.keyRaw;
  const keyX = Buffer.from(publicKey.slice(1, 1 + 32));
  const keyY = Buffer.from(publicKey.slice(33, 33 + 32));

  const verifier = { key: { x: keyX, y: keyY, kid: createFingerprint(certificate) } };

  return cose.sign.verify(data, verifier).then((buf) => cbor.decode(buf));
};

const createFingerprint = (certificate) => {
  const hash = createHash("sha256").update(certificate.raw).digest();
  return new Uint8Array(hash).slice(0, 8);
};

const createSecurity = (localUsername, localPassword, certificateFile, privateKeyFile) => {
  const certificate = Certificate.fromPEM(fs.readFileSync(certificateFile));
  const privateKey = PrivateKey.fromPEM(fs.readFileSync(privateKeyFile));

  return {
    hashPassword,
    authenticate: (request, username, password) =>
      authenticate(localUsername, hashPassword(localPassword), request, username, password),
    sign: (data) => coseSign(data, certificate, privateKey),
    verify: (data) => coseVerify(data, certificate),
    fingerprint: () => createFingerprint(certificate),
  };
};

module.exports = createSecurity;
