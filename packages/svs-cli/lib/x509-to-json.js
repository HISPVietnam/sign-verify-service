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

const { Certificate } = require("@fidm/x509");
const fs = require("fs");
const path = require("path");

const handler = argv => {
  const _publicKey = Certificate.fromPEM(fs.readFileSync(path.resolve(argv.pubkey)));

  const publicKey = {
    issuer: {
      countryName: _publicKey.issuer.countryName,
      commonName: _publicKey.issuer.commonName,
    },
    subject: {
      countryName: _publicKey.subject.countryName,
      commonName: _publicKey.subject.commonName,
    },
    validFrom: _publicKey.validFrom,
    validTo: _publicKey.validTo,
    isCA: _publicKey.isCA,
    raw: Buffer.from(_publicKey.raw).toString("base64"),
    publicKey: {
      keyRaw: Buffer.from(_publicKey.publicKey.keyRaw).toString("base64"),
    },
  };

  console.log(JSON.stringify(publicKey, null, 2));
};

module.exports = {
  command: "x509-to-json <pubkey>",
  desc: "Creates JSON from a X.509 Certificate.",
  handler,
};
