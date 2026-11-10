const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const express = require('express')
const jwt = require('jsonwebtoken')
const path = require('node:path')
const cloudinary = require('cloudinary').v2

const routePath = require.resolve(
  path.resolve(__dirname, '../dist/src/routes/cloudinaryUploadRoutes'),
)
const {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_FOLDER,
  CLOUDINARY_UPLOAD_PRESET,
} = require(path.resolve(__dirname, '../dist/src/services/cloudinaryUpload'))
const previousEnvironment = {
  JWT_SECRET: process.env.JWT_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
}

process.env.JWT_SECRET = 'unit-test-jwt-secret'
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
process.env.CLOUDINARY_API_KEY = '123456789012345'
process.env.CLOUDINARY_API_SECRET = 'unit-test-cloudinary-secret'

const app = express()
app.use(express.json())
app.use('/api', require(routePath))

let server
let endpoint

before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })
  endpoint = `http://127.0.0.1:${server.address().port}/api/uploads/cloudinary-signature`
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))

  for (const [name, value] of Object.entries(previousEnvironment)) {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
})

function token(role = 'admin') {
  return jwt.sign({ userId: 17, role }, process.env.JWT_SECRET)
}

async function requestUploadSignature({
  authorization = `Bearer ${token()}`,
  body = {},
} = {}) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

test('requires a valid JWT and admin role', async () => {
  const missingToken = await requestUploadSignature({ authorization: '' })
  assert.equal(missingToken.status, 401)

  const nonAdmin = await requestUploadSignature({
    authorization: `Bearer ${token('user')}`,
  })
  assert.equal(nonAdmin.status, 403)
})

test('signs only server-controlled upload parameters and returns no secret', async () => {
  const response = await requestUploadSignature({
    body: {
      folder: 'attacker-folder',
      public_id: 'attacker-id',
      timestamp: 1,
      api_secret: 'attacker-secret',
    },
  })
  assert.equal(response.status, 200)

  const result = await response.json()
  assert.equal(result.success, true)
  assert.deepEqual(Object.keys(result.data).sort(), [
    'apiKey',
    'cloudName',
    'folder',
    'publicId',
    'signature',
    'timestamp',
  ])
  assert.equal(result.data.cloudName, 'test-cloud')
  assert.equal(result.data.apiKey, '123456789012345')
  assert.equal(result.data.folder, CLOUDINARY_FOLDER)
  assert.equal(CLOUDINARY_FOLDER, 'keramik-dinoyo')
  assert.equal(CLOUDINARY_UPLOAD_PRESET, 'keramik-dinoyo-uploads')
  assert.equal(CLOUDINARY_ALLOWED_FORMATS, 'jpg,jpeg,png,webp')
  assert.match(result.data.publicId, /^[0-9a-f-]{36}$/)
  assert.ok(result.data.timestamp > 0)
  assert.equal(
    result.data.signature,
    cloudinary.utils.api_sign_request(
      {
        allowed_formats: CLOUDINARY_ALLOWED_FORMATS,
        folder: result.data.folder,
        public_id: result.data.publicId,
        timestamp: result.data.timestamp,
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
      },
      process.env.CLOUDINARY_API_SECRET,
    ),
  )
  assert.equal(
    JSON.stringify(result).includes(process.env.CLOUDINARY_API_SECRET),
    false,
  )
  assert.equal(Object.hasOwn(result.data, 'apiSecret'), false)
})

test('fails safely when Cloudinary credentials are missing', async () => {
  const originalSecret = process.env.CLOUDINARY_API_SECRET
  delete process.env.CLOUDINARY_API_SECRET

  try {
    const response = await requestUploadSignature()
    assert.equal(response.status, 503)
    const result = await response.json()
    assert.equal(result.success, false)
    assert.equal(JSON.stringify(result).includes('unit-test-cloudinary-secret'), false)
  } finally {
    process.env.CLOUDINARY_API_SECRET = originalSecret
  }
})
