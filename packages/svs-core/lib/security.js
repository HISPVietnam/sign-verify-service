/*
 * Copyright (c) 2021, HISP Vietnam, Co.Ltd
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * Neither the name of the HISP project nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const Bcrypt = require("bcrypt");
const cose = require("cose-js");
const cbor = require("cbor");
const zlib = require("zlib");
const createHash = require("crypto").createHash;
const { Certificate, PrivateKey } = require("@fidm/x509");
const base45 = require("base45");

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

const coseSign = async (data, publicKey, privateKey) => {
  const headers = {
    p: { alg: "ES256", kid: createFingerprint(publicKey) },
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

const coseVerify = (data, publicKey) => {
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

  const publicKeyRaw = publicKey.publicKey.keyRaw;
  const keyX = Buffer.from(publicKeyRaw.slice(1, 1 + 32));
  const keyY = Buffer.from(publicKeyRaw.slice(33, 33 + 32));

  const verifier = { key: { x: keyX, y: keyY, kid: createFingerprint(publicKey) } };

  return cose.sign.verify(data, verifier).then((buf) => cbor.decode(buf));
};

const createFingerprint = (publicKey) => {
  const hash = createHash("sha256").update(publicKey.raw).digest();
  return new Uint8Array(hash).slice(0, 8);
};

const createSecurity = (cfg) => {
  const publicKey = Certificate.fromPEM(cfg.keys.public);
  const privateKey = PrivateKey.fromPEM(cfg.keys.private);

  const o = {
    hashPassword,
    authenticate: (request, username, password) =>
      authenticate(cfg.http.auth.username, hashPassword(cfg.http.auth.password), request, username, password),
  };

  if (cfg.verify.enabled) {
    o.verify = (data) => coseVerify(data, publicKey);
    o.fingerprint = () => createFingerprint(publicKey);
  }

  if (cfg.sign.enabled) {
    o.sign = (data) => coseSign(data, publicKey, privateKey);
  }

  return o;
};

module.exports = createSecurity;
