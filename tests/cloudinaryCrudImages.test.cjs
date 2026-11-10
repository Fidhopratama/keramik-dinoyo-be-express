const assert = require('node:assert/strict')
const { after, test } = require('node:test')
const Module = require('node:module')
const path = require('node:path')

const projectRoot = path.resolve(__dirname, '..')
const modelsPath = require.resolve(path.join(projectRoot, 'dist/src/models'))
const originalModelsModule = require.cache[modelsPath]
const previousCloudName = process.env.CLOUDINARY_CLOUD_NAME
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'

const imageUrl =
  'https://res.cloudinary.com/test-cloud/image/upload/v1/keramik-dinoyo/test-image.jpg'
const productRows = new Map()
const shopRows = new Map()
const workshopRows = new Map()

function makeInstance(rows, row) {
  return {
    ...row,
    async update(values) {
      Object.assign(this, values)
      const { update: _update, ...stored } = this
      rows.set(String(this.id), stored)
      return this
    },
    async destroy() {
      rows.delete(String(this.id))
    },
  }
}

const Product = {
  async findByPk(id) {
    const row = productRows.get(String(id))
    return row ? makeInstance(productRows, row) : null
  },
  async findOne() {
    return null
  },
  async create(values) {
    const row = { id: 1, ...values }
    productRows.set('1', row)
    return makeInstance(productRows, row)
  },
}

const Shop = {
  async findByPk(id) {
    const row = shopRows.get(String(id))
    return row ? makeInstance(shopRows, row) : { id: 1, name: 'Test shop' }
  },
  async create(values) {
    const row = { id: 1, ...values }
    shopRows.set('1', row)
    return makeInstance(shopRows, row)
  },
}

const Category = { findByPk: async () => null }

const Workshop = {
  async findByPk(id) {
    const row = workshopRows.get(String(id))
    return row ? makeInstance(workshopRows, row) : null
  },
  async create(values) {
    const row = { id: 1, ...values }
    workshopRows.set('1', row)
    return makeInstance(workshopRows, row)
  },
}

const modelsModule = new Module(modelsPath)
modelsModule.filename = modelsPath
modelsModule.loaded = true
modelsModule.exports = { Product, Shop, Category, Workshop }
require.cache[modelsPath] = modelsModule

const productController = require(
  path.join(projectRoot, 'dist/src/controllers/productController'),
)
const shopController = require(
  path.join(projectRoot, 'dist/src/controllers/shopController'),
)
const workshopController = require(
  path.join(projectRoot, 'dist/src/controllers/workshopController'),
)
const cloudinaryImage = require(
  path.join(projectRoot, 'dist/src/utils/cloudinaryImage'),
)

after(() => {
  if (originalModelsModule) require.cache[modelsPath] = originalModelsModule
  else delete require.cache[modelsPath]

  if (previousCloudName === undefined) delete process.env.CLOUDINARY_CLOUD_NAME
  else process.env.CLOUDINARY_CLOUD_NAME = previousCloudName
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

test('accepts Cloudinary image URLs on Product, Shop, and Workshop create and update', async () => {
  const productCreateResponse = responseRecorder()
  await productController.createProduct(
    {
      body: {
        shop_id: 1,
        name: 'Test product',
        price: '15000',
        image: imageUrl,
      },
    },
    productCreateResponse,
  )
  assert.equal(productCreateResponse.statusCode, 201)
  assert.equal(productRows.get('1').image, imageUrl)

  const productUpdateResponse = responseRecorder()
  await productController.updateProduct(
    {
      params: { id: '1' },
      body: {
        shop_id: 1,
        name: 'Test product',
        price: '15000',
        image: imageUrl,
      },
    },
    productUpdateResponse,
  )
  assert.equal(productUpdateResponse.statusCode, 200)
  assert.equal(productRows.get('1').image, imageUrl)

  const shopCreateResponse = responseRecorder()
  await shopController.createShop(
    { body: { name: 'Test shop', image: imageUrl } },
    shopCreateResponse,
  )
  assert.equal(shopCreateResponse.statusCode, 201)
  assert.equal(shopRows.get('1').image, imageUrl)

  const shopUpdateResponse = responseRecorder()
  await shopController.updateShop(
    { params: { id: '1' }, body: { image: imageUrl } },
    shopUpdateResponse,
  )
  assert.equal(shopUpdateResponse.statusCode, 200)
  assert.equal(shopRows.get('1').image, imageUrl)

  const workshopCreateResponse = responseRecorder()
  await workshopController.createWorkshop(
    {
      body: {
        title: 'Test workshop',
        date: '2026-11-10',
        start_time: '10:00',
        end_time: '12:00',
        image: imageUrl,
      },
    },
    workshopCreateResponse,
  )
  assert.equal(workshopCreateResponse.statusCode, 201)
  assert.equal(workshopRows.get('1').image, imageUrl)

  const workshopUpdateResponse = responseRecorder()
  await workshopController.updateWorkshop(
    { params: { id: '1' }, body: { image: imageUrl } },
    workshopUpdateResponse,
  )
  assert.equal(workshopUpdateResponse.statusCode, 200)
  assert.equal(workshopRows.get('1').image, imageUrl)
})

test('accepts only HTTPS image URLs for the configured Cloudinary cloud', () => {
  assert.equal(cloudinaryImage.isCloudinaryImageUrl(imageUrl), true)
  assert.equal(
    cloudinaryImage.isCloudinaryImageUrl(
      'http://res.cloudinary.com/test-cloud/image/upload/test.jpg',
    ),
    false,
  )
  assert.equal(
    cloudinaryImage.isCloudinaryImageUrl(
      'https://res.cloudinary.com/other-cloud/image/upload/test.jpg',
    ),
    false,
  )
  assert.equal(
    cloudinaryImage.isCloudinaryImageUrl('https://example.com/image.jpg'),
    false,
  )
})
