#!/bin/sh
#
# CSCA key
#
set -e

# If you are on Mac, you might want to use brew to install openssl and use
# OPENSSL=/usr/local/Cellar/openssl\@1.1/1.1.1k/bin/openssl
# The included LibreSSL seems to have some issues generating these certs

# https://jmrtd.org/certificates.shtml
# CSCA = Country Signing Certificate Authority
# CSC = Country Signing Certificate
# DSC = Document Signing Certificate

OPENSSL=${OPENSSL:=openssl}

${OPENSSL} ecparam -name prime256v1 -genkey -noout -out csca.key
${OPENSSL} req -x509 \
    -subj '/CN=National CSCA of Friesland/C=FR/' \
    -key csca.key \
    -out csca.pem -nodes \
    -days 3650

# DSC keys
for i in 1 2 3 4 worker; do
    R=$(${OPENSSL} rand -hex 16)
    ${OPENSSL} ecparam -name prime256v1 -genkey -noout -out dsc-$i.key
    ${OPENSSL} req -new \
        -subj "/CN=DSC number $i of Friesland/C=FR/" \
        -key dsc-$i.key -nodes |
        ${OPENSSL} x509 -req -CA csca.pem -CAkey csca.key -set_serial 0x$R \
            -days 1780 \
            -out dsc-$i.pem
done

cat dsc-*.pem >masterlist-dsc.pem

# JavaScripts prefers PKCS#8
openssl pkcs8 -in dsc-worker.key -nocrypt -topk8 -out dsc-worker.p8

# Remove unneeded keys and certs
rm -f csca.key dsc-?.key dsc-?.pem
