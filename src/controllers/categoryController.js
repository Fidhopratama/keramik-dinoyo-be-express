const { Category } = require('../models')

async function getCategories(req, res) {
  try {
    const categories = await Category.findAll({
      where: {
        is_active: true,
      },
      order: [['name', 'ASC']],
    })

    return res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Get categories error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kategori.',
    })
  }
}

async function getCategoryById(req, res) {
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.',
      })
    }

    return res.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Get category detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kategori.',
    })
  }
}

async function createCategory(req, res) {
  try {
    const {
      name,
      description,
      is_active,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Nama kategori wajib diisi.',
      })
    }

    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
      },
    })

    if (existingCategory) {
      return res.status(422).json({
        success: false,
        message: 'Nama kategori sudah digunakan.',
      })
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || null,
      is_active:
        is_active !== undefined
          ? Boolean(is_active)
          : true,
    })

    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat.',
      data: category,
    })
  } catch (error) {
    console.error('Create category error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat kategori.',
    })
  }
}

async function updateCategory(req, res) {
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.',
      })
    }

    const {
      name,
      description,
      is_active,
    } = req.body

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(422).json({
          success: false,
          message: 'Nama kategori tidak boleh kosong.',
        })
      }

      const existingCategory = await Category.findOne({
        where: {
          name: name.trim(),
        },
      })

      if (
        existingCategory &&
        existingCategory.id !== category.id
      ) {
        return res.status(422).json({
          success: false,
          message: 'Nama kategori sudah digunakan.',
        })
      }

      category.name = name.trim()
    }

    if (description !== undefined) {
      category.description = description
    }

    if (is_active !== undefined) {
      category.is_active = Boolean(is_active)
    }

    await category.save()

    return res.json({
      success: true,
      message: 'Kategori berhasil diperbarui.',
      data: category,
    })
  } catch (error) {
    console.error('Update category error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kategori.',
    })
  }
}

async function deleteCategory(req, res) {
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.',
      })
    }

    await category.destroy()

    return res.json({
      success: true,
      message: 'Kategori berhasil dihapus.',
    })
  } catch (error) {
    console.error('Delete category error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori.',
    })
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}