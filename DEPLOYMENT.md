# Node.js deployment

## Build and start

Use a persistent Node.js hosting service for the Express server.

1. Install dependencies, including development dependencies, during the build stage.
2. Run `npm run build` as the deployment build command. This compiles TypeScript into `dist/`.
3. Run `npm start` as the start command. It only starts `node dist/src/server.js`; it does not compile source at runtime.
4. Provide the port assigned by the hosting service through `PORT`. The server binds to `0.0.0.0`.

The committed `dist/` output is kept in sync with source, but deployment should still run the build command for the exact revision being deployed.

## Environment variables

Configure these names in the hosting provider's environment settings; keep secret values out of source control and logs.

- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`: MySQL connection.
- `DB_PORT`: MySQL port; defaults to `3306`.
- `JWT_SECRET`: JWT signing and verification.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials. Keep all three in backend environment settings; never expose the API secret to frontend code or logs.
- `FRONTEND_ORIGIN`: exact frontend origins allowed by CORS; separate multiple origins with commas. Include scheme and host, but no path. Development defaults to `http://localhost:3000` and `http://127.0.0.1:3000` when unset; production must set this explicitly.
- `PORT`: public Node server port assigned by hosting; defaults to `5050`.
- `AI_SERVICE_URL`: optional URL of the AI service. If unset, the code uses a local development address.

## Cloudinary uploads

Create a **signed** Cloudinary upload preset named `keramik-dinoyo-uploads` and enforce these restrictions in the preset:

- Allowed formats: JPG, JPEG, PNG, WEBP.
- Maximum file size: 5 MB.

The backend signs `timestamp`, `folder`, `public_id`, `allowed_formats` (`jpg,jpeg,png,webp`), and `upload_preset`. The preset name and allowed formats are fixed in the backend; the frontend must send those exact same parameter values along with the signature response fields to Cloudinary's image upload API. The signature endpoint itself returns only `cloudName`, `apiKey`, `timestamp`, `signature`, `folder`, and `publicId`.

Request a signature with `POST /api/uploads/cloudinary-signature` and an admin JWT Bearer token. The request body is ignored; the backend chooses the folder, timestamp, and unique public ID. A successful response has this shape:

```json
{
  "success": true,
  "data": {
    "cloudName": "your-cloud-name",
    "apiKey": "your-public-api-key",
    "timestamp": 1794270000,
    "signature": "generated-signature",
    "folder": "keramik-dinoyo",
    "publicId": "generated-uuid"
  }
}
```

Send the resulting Cloudinary `secure_url` in the existing Product, Shop, or Workshop CRUD JSON payload as `image`. The backend accepts only HTTPS image URLs for the configured Cloudinary cloud. Image URLs and old Blob URLs already stored in the database are not modified by this migration.

The preset is the enforcement point for direct-upload format and size restrictions; the browser's file checks are only convenience checks. Verify the preset's restrictions in the Cloudinary console before enabling uploads. The backend does not proxy or independently inspect the bytes of a direct browser upload.

## Deployment checks

- Confirm the deployment has public HTTPS routing to `POST /api/uploads/cloudinary-signature`.
- Confirm the health endpoint `GET /api/health` is reachable.
- Confirm production frontend origins are listed in `FRONTEND_ORIGIN`; requests with no `Origin` header are allowed for server-to-server use.
- Verify a signed upload with the real Cloudinary account and confirm the preset rejects disallowed formats and files larger than 5 MB.
- Confirm Cloudinary image URLs can be saved through each Product, Shop, and Workshop CRUD endpoint.
- Existing Blob objects and the historical `upload_sessions` table are left untouched; no database migration or Blob deletion is performed.
- Configure persistent storage separately if local multipart uploads must survive redeployments or be shared across multiple instances.
