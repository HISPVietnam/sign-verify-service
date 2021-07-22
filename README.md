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
