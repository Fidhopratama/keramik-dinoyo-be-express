
import type { Request, Response } from 'express'

const { Category } = require('../models')

interface CategoryBody {
  name?: string
  description?: string | null
  is_active?: boolean | string
}

interface CategoryParams {
  id: string
}

export async function getCategories(
  _req: Request,
  res: Response
): Promise<Response> {
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
  } catch (error: unknown) {
    console.error('Get categories error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kategori.',
    })
  }
}

export async function getCategoryById(
  req: Request<CategoryParams>,
  res: Response
): Promise<Response> {
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
  } catch (error: unknown) {
    console.error('Get category detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kategori.',
    })
  }
}

export async function createCategory(
  req: Request<{}, {}, CategoryBody>,
  res: Response
): Promise<Response> {
  try {
    const { name, description, is_active } = req.body

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Nama kategori wajib diisi.',
      })
    }

    const trimmedName = name.trim()

    const existingCategory = await Category.findOne({
      where: {
        name: trimmedName,
      },
    })

    if (existingCategory) {
      return res.status(422).json({
        success: false,
        message: 'Nama kategori sudah digunakan.',
      })
    }

    const category = await Category.create({
      name: trimmedName,
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
  } catch (error: unknown) {
    console.error('Create category error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat kategori.',
    })
  }
}

export async function updateCategory(
  req: Request<CategoryParams, {}, CategoryBody>,
  res: Response
): Promise<Response> {
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.',
      })
    }

    const { name, description, is_active } = req.body

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(422).json({
          success: false,
          message: 'Nama kategori tidak boleh kosong.',
        })
      }

      const trimmedName = name.trim()

      const existingCategory = await Category.findOne({
        where: {
          name: trimmedName,
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

      category.name = trimmedName
    }

    if (description !== undefined) {
      category.description = description
    }

    if (is_active !== undefined) {
      category.is_active =
        typeof is_active === 'string'
          ? is_active === 'true'
          : Boolean(is_active)
    }

    await category.save()

    return res.json({
      success: true,
      message: 'Kategori berhasil diperbarui.',
      data: category,
    })
  } catch (error: unknown) {
    console.error('Update category error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kategori.',
    })
  }
}

export async function deleteCategory(
  req: Request<CategoryParams>,
  res: Response
): Promise<Response> {
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
  } catch (error: unknown) {
    console.error('Delete category error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori.',
    })
  }
}