#!/bin/sh

# ES256 = P-256 EC + SHA256

openssl ecparam -name prime256v1 -genkey -noout -out dsc-$1.key
openssl req -new -subj "/C=VN/CN=HISP Vietnam DSC $1" -key dsc-$1.key -nodes |
    openssl x509 -req -CA csca.pem -CAkey csca.key -set_serial 0x1 -days 365 -out dsc-$1.pem
openssl pkcs8 -in dsc-$1.key -nocrypt -topk8 -out dsc-$1.p8
