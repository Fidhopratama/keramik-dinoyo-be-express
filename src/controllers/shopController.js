const { Shop } = require('../models')

async function getShops(req, res) {
  try {
    const shops = await Shop.findAll({
      order: [['id', 'ASC']],
    })

    return res.json({
      success: true,
      data: shops,
    })
  } catch (error) {
    console.error('Get shops error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data toko.',
    })
  }
}

async function getShopById(req, res) {
  try {
    const shop = await Shop.findByPk(req.params.id)

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan.',
      })
    }

    return res.json({
      success: true,
      data: shop,
    })
  } catch (error) {
    console.error('Get shop detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail toko.',
    })
  }
}

async function createShop(req, res) {
  try {
    const {
      name,
      description,
      instagram,
      tiktok,
      whatsapp,
      address,
      is_active,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Nama toko wajib diisi.',
      })
    }

    const image = req.file
      ? `/uploads/shops/${req.file.filename}`
      : null

    const shop = await Shop.create({
      name: name.trim(),
      description: description || null,
      image,
      instagram: instagram || null,
      tiktok: tiktok || null,
      whatsapp: whatsapp || null,
      address: address || null,
      is_active:
        is_active === undefined
          ? true
          : is_active === '1' ||
            is_active === 'true' ||
            is_active === true,
    })

    return res.status(201).json({
      success: true,
      message: 'Toko berhasil dibuat.',
      data: shop,
    })
  } catch (error) {
    console.error('Create shop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat toko.',
    })
  }
}

async function updateShop(req, res) {
  try {
    const shop = await Shop.findByPk(req.params.id)

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan.',
      })
    }

    const {
      name,
      description,
      instagram,
      tiktok,
      whatsapp,
      address,
      is_active,
    } = req.body

    const updateData = {}

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(422).json({
          success: false,
          message: 'Nama toko wajib diisi.',
        })
      }

      updateData.name = name.trim()
    }

    if (description !== undefined) {
      updateData.description = description
    }

    if (instagram !== undefined) {
      updateData.instagram = instagram
    }

    if (tiktok !== undefined) {
      updateData.tiktok = tiktok
    }

    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp
    }

    if (address !== undefined) {
      updateData.address = address
    }

    if (is_active !== undefined) {
      updateData.is_active =
        is_active === '1' ||
        is_active === 'true' ||
        is_active === true
    }

    if (req.file) {
      updateData.image = `/uploads/shops/${req.file.filename}`
    }

    await shop.update(updateData)

    return res.json({
      success: true,
      message: 'Toko berhasil diperbarui.',
      data: shop,
    })
  } catch (error) {
    console.error('Update shop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui toko.',
    })
  }
}

async function deleteShop(req, res) {
  try {
    const shop = await Shop.findByPk(req.params.id)

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Toko tidak ditemukan.',
      })
    }

    await shop.destroy()

    return res.json({
      success: true,
      message: 'Toko berhasil dihapus.',
    })
  } catch (error) {
    console.error('Delete shop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus toko.',
    })
  }
}

module.exports = {
  getShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
}