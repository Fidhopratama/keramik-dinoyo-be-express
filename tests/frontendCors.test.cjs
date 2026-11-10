const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const express = require('express')
const path = require('node:path')

const corsModulePath = require.resolve(
  path.resolve(__dirname, '../dist/src/middleware/frontendCors'),
)
const { createFrontendCorsMiddleware } = require(corsModulePath)
const app = express()
app.use(
  createFrontendCorsMiddleware(
    'https://store.example.test, https://admin.example.test',
  ),
)
app.get('/resource', (_req, res) => res.json({ success: true }))

let server
let endpoint

before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })
  endpoint = `http://127.0.0.1:${server.address().port}/resource`
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
})

test('allows each exact configured frontend origin', async () => {
  for (const origin of [
    'https://store.example.test',
    'https://admin.example.test',
  ]) {
    const response = await fetch(endpoint, { headers: { origin } })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('access-control-allow-origin'), origin)
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true')
  }
})

test('rejects an origin that is not allowlisted', async () => {
  const response = await fetch(endpoint, {
    headers: { origin: 'https://attacker.example.test' },
  })
  assert.equal(response.status, 403)
  assert.equal(response.headers.get('access-control-allow-origin'), null)
})

test('allows requests without an Origin header', async () => {
  const response = await fetch(endpoint)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), null)
})

test('rejects malformed or non-origin entries from configuration', async () => {
  const strictApp = express()
  strictApp.use(
    createFrontendCorsMiddleware(
      'https://allowed.example.test/path,not-a-url',
    ),
  )
  strictApp.get('/resource', (_req, res) => res.json({ success: true }))
  const strictServer = strictApp.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    strictServer.once('listening', resolve)
    strictServer.once('error', reject)
  })

  try {
    const response = await fetch(
      `http://127.0.0.1:${strictServer.address().port}/resource`,
      { headers: { origin: 'https://allowed.example.test' } },
    )
    assert.equal(response.status, 403)
  } finally {
    await new Promise((resolve) => strictServer.close(resolve))
  }
})
