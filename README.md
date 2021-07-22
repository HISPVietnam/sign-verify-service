# sign-verify-service

Small service for signing JSON payloads and returning QRCode.

## API

The service exposes 2 endpoints

- POST `/certificate/sign` send JSON to this endpoint to get a signed QRCode
- POST `/certificate/verify` send the QRCode text to verify the signature

## Example `.env` file

```
HOST=localhost
PORT=3000
CERTIFICATE=./certs/dsc-worker.pem
PRIVATE_KEY=./certs/dsc-worker.p8
USERNAME=0D5587BF-F12B-4BC9-9D3D-B2C3D607BD6F
PASSWORD=51CB6AA3-0EBE-4DD5-B6DC-3E9FFA3E86EB
```

## Links

- https://github.com/ehn-dcc-development/hcert-spec
- https://github.com/ehn-dcc-development/hcert-spec/blob/main/README.md
- https://github.com/ehn-dcc-development/hcert-spec/blob/main/hcert_spec.md
- https://gir.st/blog/greenpass.html
- https://www.scandit.com/blog/eu-digital-green-certificates/
- https://play.google.com/store/apps/details?id=net.almaware.app.greenpassqrreader
- https://apps.apple.com/us/app/greenpass-qr-code-reader/id1574484036
- https://dev.to/lmillucci/javascript-how-to-decode-the-greenpass-qr-code-3dh0
- https://hackernoon.com/how-to-decode-your-own-eu-vaccination-green-pass-with-a-few-lines-of-python-9v2c37s1
