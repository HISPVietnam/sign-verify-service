# sign-verify-service

Small service for signing JSON payloads and returning QRCode.

## API

The service exposes 2 endpoints

- POST `/certificate/sign` send JSON to this endpoint to get a signed QRCode
- POST `/certificate/verify` send the QRCode text to verify the signature

