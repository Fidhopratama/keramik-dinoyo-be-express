
import type { Request, Response } from 'express'

const { Shop } = require('../models')

interface ShopParams {
  id: string
}

interface ShopBody {
  name?: string
  description?: string | null
  instagram?: string | null
  tiktok?: string | null
  whatsapp?: string | null
  address?: string | null
  is_active?: boolean | string | number
}

interface UploadedFile {
  filename: string
}

type ShopRequest<
  P = Record<string, never>,
  B = unknown,
> = Request<P, unknown, B> & {
  file?: UploadedFile
}

interface ShopUpdateData {
  name?: string
  description?: string | null
  instagram?: string | null
  tiktok?: string | null
  whatsapp?: string | null
  address?: string | null
  is_active?: boolean
  image?: string | null
}

function parseIsActive(value: boolean | string | number): boolean {
  return value === true || value === '1' || value === 'true' || value === 1
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Terjadi kesalahan database.'
}

// GET /api/shops
export async function getShops(
  _req: Request,
  res: Response
): Promise<Response> {
  try {
    const shops = await Shop.findAll({
      order: [['id', 'ASC']],
    })

    return res.json({
      success: true,
      data: shops,
    })
  } catch (error: unknown) {
    console.error('Get shops error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data toko.',
      error: getErrorMessage(error),
    })
  }
}

// GET /api/shops/:id
export async function getShopById(
  req: Request<ShopParams>,
  res: Response
): Promise<Response> {
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
  } catch (error: unknown) {
    console.error('Get shop detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail toko.',
      error: getErrorMessage(error),
    })
  }
}

// POST /api/shops
export async function createShop(
  req: ShopRequest<Record<string, never>, ShopBody>,
  res: Response
): Promise<Response> {
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

    if (typeof name !== 'string' || !name.trim()) {
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
          : parseIsActive(is_active),
    })

    return res.status(201).json({
      success: true,
      message: 'Toko berhasil dibuat.',
      data: shop,
    })
  } catch (error: unknown) {
    console.error('Create shop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat toko.',
      error: getErrorMessage(error),
    })
  }
}

// PUT /api/shops/:id
export async function updateShop(
  req: ShopRequest<ShopParams, ShopBody>,
  res: Response
): Promise<Response> {
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

    const updateData: ShopUpdateData = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
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
      updateData.is_active = parseIsActive(is_active)
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
  } catch (error: unknown) {
    console.error('Update shop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui toko.',
      error: getErrorMessage(error),
    })
  }
}

// DELETE /api/shops/:id
export async function deleteShop(
  req: Request<ShopParams>,
  res: Response
): Promise<Response> {
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
  } catch (error: unknown) {
    console.error('Delete shop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus toko.',
      error: getErrorMessage(error),
    })
  }
}