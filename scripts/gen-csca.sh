#!/bin/sh

openssl ecparam -name prime256v1 -genkey -noout -out csca.key
openssl req -x509 -key csca.key -days 365 -subj "/C=NO/CN=My Certificate Authority" -out csca.pem -nodes -new
