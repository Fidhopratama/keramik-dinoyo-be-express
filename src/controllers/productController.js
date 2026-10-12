const {
  Product,
  Shop,
  Category,
} = require('../models')

function makeSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getProductImagePath(file) {
  if (!file) {
    return null
  }

  return `products/${file.filename}`
}

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      search,
      shop_id,
      category_id,
      status,
    } = req.query

    const where = {}

    if (search) {
      const { Op } = require('sequelize')

      where[Op.or] = [
        {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          description: {
            [Op.like]: `%${search}%`,
          },
        },
      ]
    }

    if (shop_id) {
      where.shop_id = shop_id
    }

    if (category_id) {
      where.category_id = category_id
    }

    if (status) {
      where.status = status
    }

    const products =
      await Product.findAll({
        where,

        include: [
          {
            model: Shop,
            as: 'shop',
            attributes: [
              'id',
              'name',
            ],
          },

          {
            model: Category,
            as: 'category',
            attributes: [
              'id',
              'name',
            ],
          },
        ],

        order: [
          ['id', 'DESC'],
        ],
      })

    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error(
      'getProducts error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal mengambil data produk.',
      error: error.message,
    })
  }
}

// GET /api/products/:id
const getProductById = async (
  req,
  res,
) => {
  try {
    const product =
      await Product.findByPk(
        req.params.id,
        {
          include: [
            {
              model: Shop,
              as: 'shop',
              attributes: [
                'id',
                'name',
              ],
            },

            {
              model: Category,
              as: 'category',
              attributes: [
                'id',
                'name',
              ],
            },
          ],
        },
      )

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          'Produk tidak ditemukan.',
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error(
      'getProductById error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal mengambil detail produk.',
      error: error.message,
    })
  }
}

// POST /api/products
const createProduct = async (
  req,
  res,
) => {
  try {
    const {
      shop_id,
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      status,
    } = req.body

    if (
      !shop_id ||
      !name ||
      price === undefined ||
      price === null ||
      price === ''
    ) {
      return res.status(422).json({
        success: false,
        message:
          'shop_id, name, dan price wajib diisi.',
      })
    }

    const shop =
      await Shop.findByPk(shop_id)

    if (!shop) {
      return res.status(422).json({
        success: false,
        message:
          'Toko tidak ditemukan.',
      })
    }

    if (category_id) {
      const category =
        await Category.findByPk(
          category_id,
        )

      if (!category) {
        return res.status(422).json({
          success: false,
          message:
            'Kategori tidak ditemukan.',
        })
      }
    }

    const finalSlug =
      slug?.trim() ||
      makeSlug(name)

    const existingSlug =
      await Product.findOne({
        where: {
          slug: finalSlug,
        },
      })

    if (existingSlug) {
      return res.status(422).json({
        success: false,
        message:
          'Slug produk sudah digunakan.',
      })
    }

    const image =
      getProductImagePath(req.file)

    const product =
      await Product.create({
        shop_id,
        category_id:
          category_id || null,
        name,
        slug: finalSlug,
        description:
          description || null,
        price,
        stock:
          stock !== undefined &&
          stock !== ''
            ? stock
            : 0,
        image,
        status:
          status || 'active',
      })

    const result =
      await Product.findByPk(
        product.id,
        {
          include: [
            {
              model: Shop,
              as: 'shop',
              attributes: [
                'id',
                'name',
              ],
            },

            {
              model: Category,
              as: 'category',
              attributes: [
                'id',
                'name',
              ],
            },
          ],
        },
      )

    res.status(201).json({
      success: true,
      message:
        'Produk berhasil ditambahkan.',
      data: result,
    })
  } catch (error) {
    console.error(
      'createProduct error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal menambahkan produk.',
      error: error.message,
    })
  }
}

// PUT /api/products/:id
const updateProduct = async (
  req,
  res,
) => {
  try {
    const product =
      await Product.findByPk(
        req.params.id,
      )

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          'Produk tidak ditemukan.',
      })
    }

    const {
      shop_id,
      category_id,
      name,
      slug,
      description,
      price,
      stock,
      status,
    } = req.body

    if (
      !shop_id ||
      !name ||
      price === undefined ||
      price === null ||
      price === ''
    ) {
      return res.status(422).json({
        success: false,
        message:
          'shop_id, name, dan price wajib diisi.',
      })
    }

    const shop =
      await Shop.findByPk(shop_id)

    if (!shop) {
      return res.status(422).json({
        success: false,
        message:
          'Toko tidak ditemukan.',
      })
    }

    if (category_id) {
      const category =
        await Category.findByPk(
          category_id,
        )

      if (!category) {
        return res.status(422).json({
          success: false,
          message:
            'Kategori tidak ditemukan.',
        })
      }
    }

    const finalSlug =
      slug?.trim() ||
      makeSlug(name)

    const existingSlug =
      await Product.findOne({
        where: {
          slug: finalSlug,
        },
      })

    if (
      existingSlug &&
      existingSlug.id !== product.id
    ) {
      return res.status(422).json({
        success: false,
        message:
          'Slug produk sudah digunakan.',
      })
    }

    const updateData = {
      shop_id,
      category_id:
        category_id || null,
      name,
      slug: finalSlug,
      description:
        description || null,
      price,
      stock:
        stock !== undefined &&
        stock !== ''
          ? stock
          : 0,
      status:
        status || 'active',
    }

    if (req.file) {
      updateData.image =
        getProductImagePath(
          req.file,
        )
    }

    await product.update(
      updateData,
    )

    const result =
      await Product.findByPk(
        product.id,
        {
          include: [
            {
              model: Shop,
              as: 'shop',
              attributes: [
                'id',
                'name',
              ],
            },

            {
              model: Category,
              as: 'category',
              attributes: [
                'id',
                'name',
              ],
            },
          ],
        },
      )

    res.json({
      success: true,
      message:
        'Produk berhasil diperbarui.',
      data: result,
    })
  } catch (error) {
    console.error(
      'updateProduct error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Gagal memperbarui produk.',
      error: error.message,
    })
  }
}

// DELETE /api/products/:id
const deleteProduct = async (
  req,
  res,
) => {
  try {
    const product =
      await Product.findByPk(
        req.params.id,
      )

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          'Produk tidak ditemukan.',
      })
    }

    await product.destroy()

    res.json({
      success: true,
      message:
        'Produk berhasil dihapus.',
    })
  } catch (error) {
    console.error(
      'deleteProduct error:',
      error,
    )

    const errorMessage =
      error?.parent?.sqlMessage ||
      error?.original?.sqlMessage ||
      error?.message ||
      'Terjadi kesalahan database.'

    if (
      errorMessage
        .toLowerCase()
        .includes('foreign key')
    ) {
      return res.status(409).json({
        success: false,
        message:
          'Produk tidak bisa dihapus karena masih digunakan oleh data lain.',
        error: errorMessage,
      })
    }

    res.status(500).json({
      success: false,
      message:
        'Gagal menghapus produk.',
      error: errorMessage,
    })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}