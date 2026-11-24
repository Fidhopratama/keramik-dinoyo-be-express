const assert = require('node:assert/strict')
const { after, test } = require('node:test')
const Module = require('node:module')
const path = require('node:path')

const projectRoot = path.resolve(__dirname, '..')
const modelsPath = require.resolve(path.join(projectRoot, 'dist/src/models'))
const originalModelsModule = require.cache[modelsPath]
let queryOptions

const Product = {
  async findAndCountAll(options) {
    queryOptions = options
    return { count: 500, rows: Array.from({ length: options.limit }, (_, i) => ({ id: i + 1 })) }
  },
}
const modelsModule = new Module(modelsPath)
modelsModule.filename = modelsPath
modelsModule.loaded = true
modelsModule.exports = { Product, Shop: {}, Category: {} }
require.cache[modelsPath] = modelsModule

const { getProducts } = require(
  path.join(projectRoot, 'dist/src/controllers/productController'),
)

after(() => {
  if (originalModelsModule) require.cache[modelsPath] = originalModelsModule
  else delete require.cache[modelsPath]
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

test('returns the requested product page with pagination metadata', async () => {
  const res = responseRecorder()

  await getProducts({ query: { page: '2', limit: '10' } }, res)

  assert.equal(queryOptions.limit, 10)
  assert.equal(queryOptions.offset, 10)
  assert.equal(res.body.data.length, 10)
  assert.deepEqual(res.body.pagination, {
    total: 500,
    page: 2,
    limit: 10,
    totalPages: 50,
  })
})

test('uses defaults and caps the requested page size', async () => {
  const defaultResponse = responseRecorder()
  await getProducts({ query: {} }, defaultResponse)
  assert.equal(queryOptions.limit, 20)
  assert.equal(queryOptions.offset, 0)
  assert.equal(defaultResponse.body.pagination.totalPages, 25)

  const cappedResponse = responseRecorder()
  await getProducts({ query: { page: '1', limit: '500' } }, cappedResponse)
  assert.equal(queryOptions.limit, 100)
  assert.equal(cappedResponse.body.pagination.limit, 100)
})

test('rejects invalid pagination values', async () => {
  for (const query of [
    { page: '0' },
    { limit: '-1' },
    { page: '1.5' },
  ]) {
    const res = responseRecorder()
    await getProducts({ query }, res)
    assert.equal(res.statusCode, 422)
    assert.equal(res.body.success, false)
  }
})
