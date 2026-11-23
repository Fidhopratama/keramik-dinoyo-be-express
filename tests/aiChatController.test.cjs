require('tsx/cjs')

const assert = require('node:assert/strict')
const { after, test } = require('node:test')
const axios = require('axios')

const originalPost = axios.post
const previousServiceToken = process.env.AI_SERVICE_TOKEN
process.env.AI_SERVICE_TOKEN = 'unit-test-service-token'

const { chat } = require('../src/controllers/aiChatController.ts')

after(() => {
  axios.post = originalPost
  if (previousServiceToken === undefined) {
    delete process.env.AI_SERVICE_TOKEN
  } else {
    process.env.AI_SERVICE_TOKEN = previousServiceToken
  }
})

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test('forwards only message and recent history through the internal AI service', async () => {
  let requestBody
  let requestConfig
  axios.post = async (_url, body, config) => {
    requestBody = body
    requestConfig = config
    return {
      data: {
        success: true,
        data: {
          reply: 'Silakan lihat tab Jelajah untuk informasi terbaru.',
          suggestions: ['Apa saja jenis keramik?'],
        },
      },
    }
  }

  const res = responseRecorder()
  await chat(
    {
      body: {
        message: 'Rekomendasikan produk yang ada',
        conversation_id: 'conversation-test',
        history: [{ role: 'user', content: 'Cari keramik' }],
      },
    },
    res,
  )

  assert.deepEqual(Object.keys(requestBody).sort(), [
    'conversation_id',
    'history',
    'message',
  ])
  assert.equal(requestConfig.headers.Authorization, 'Bearer unit-test-service-token')
  assert.equal(res.body.success, true)
  assert.deepEqual(res.body.data, {
    conversation_id: 'conversation-test',
    reply: 'Silakan lihat tab Jelajah untuk informasi terbaru.',
    suggestions: ['Apa saja jenis keramik?'],
  })
})

test('rejects an overlong message before calling the AI service', async () => {
  let called = false
  axios.post = async () => {
    called = true
    throw new Error('must not be called')
  }

  const res = responseRecorder()
  await chat({ body: { message: 'x'.repeat(1201) } }, res)

  assert.equal(res.statusCode, 422)
  assert.equal(res.body.success, false)
  assert.equal(called, false)
})
