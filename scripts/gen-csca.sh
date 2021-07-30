#!/bin/sh

# ES256 = P-256 EC + SHA256

openssl ecparam -name prime256v1 -genkey -noout -out csca.key
openssl req -x509 -key csca.key -days 365 -subj "/C=VN/CN=HISP Vietnam CA" \
    -out csca.pem -nodes -new
