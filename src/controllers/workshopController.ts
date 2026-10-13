
import type { Request, Response } from 'express'

const fs = require('fs')
const path = require('path')
const { Workshop } = require('../models')

interface WorkshopParams {
  id: string
}

interface WorkshopBody {
  title?: string
  description?: string | null
  instructor?: string | null
  date?: string
  start_time?: string
  end_time?: string
  capacity?: number | string
  location?: string | null
  status?: string
}

interface UploadedFile {
  filename: string
}

type WorkshopRequest<
  P = Record<string, never>,
  B = unknown,
> = Request<P, unknown, B> & {
  file?: UploadedFile
}

interface WorkshopUpdateData {
  title?: string
  description?: string | null
  instructor?: string | null
  date?: string
  start_time?: string
  end_time?: string
  capacity?: number
  location?: string | null
  status?: string
  image?: string | null
}

function deleteUploadedFile(imagePath?: string | null): void {
  if (!imagePath) return

  const normalized = imagePath.replace(/^\/+/, '')

  if (!normalized.startsWith('uploads/workshops/')) {
    return
  }

  const filePath = path.join(process.cwd(), normalized)

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error: unknown) {
    console.error('Delete workshop image error:', error)
  }
}

function getImagePath(
  req: WorkshopRequest,
): string | null {
  if (!req.file) return null

  return `/uploads/workshops/${req.file.filename}`
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Terjadi kesalahan.'
}

export async function getWorkshops(
  _req: Request,
  res: Response,
): Promise<Response> {
  try {
    const workshops = await Workshop.findAll({
      order: [['id', 'ASC']],
    })

    return res.json({
      success: true,
      data: workshops,
    })
  } catch (error: unknown) {
    console.error('Get workshops error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data workshop.',
    })
  }
}

export async function getWorkshopById(
  req: Request<WorkshopParams>,
  res: Response,
): Promise<Response> {
  try {
    const workshop = await Workshop.findByPk(req.params.id)

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop tidak ditemukan.',
      })
    }

    return res.json({
      success: true,
      data: workshop,
    })
  } catch (error: unknown) {
    console.error('Get workshop detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail workshop.',
    })
  }
}

export async function createWorkshop(
  req: WorkshopRequest<Record<string, never>, WorkshopBody>,
  res: Response,
): Promise<Response> {
  try {
    const {
      title,
      description,
      instructor,
      date,
      start_time,
      end_time,
      capacity,
      location,
      status,
    } = req.body

    if (!title || !date || !start_time || !end_time) {
      if (req.file) {
        deleteUploadedFile(
          `/uploads/workshops/${req.file.filename}`,
        )
      }

      return res.status(422).json({
        success: false,
        message:
          'Judul, tanggal, waktu mulai, dan waktu selesai wajib diisi.',
      })
    }

    const parsedCapacity =
      capacity === undefined || capacity === ''
        ? 20
        : Number(capacity)

    if (
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity < 0
    ) {
      if (req.file) {
        deleteUploadedFile(
          `/uploads/workshops/${req.file.filename}`,
        )
      }

      return res.status(422).json({
        success: false,
        message:
          'Kapasitas workshop harus berupa angka yang valid.',
      })
    }

    const image = getImagePath(req)

    const workshop = await Workshop.create({
      title,
      description: description || null,
      instructor: instructor || null,
      date,
      start_time,
      end_time,
      capacity: parsedCapacity,
      location: location || null,
      image,
      status: status || 'upcoming',
    })

    return res.status(201).json({
      success: true,
      message: 'Workshop berhasil dibuat.',
      data: workshop,
    })
  } catch (error: unknown) {
    if (req.file) {
      deleteUploadedFile(
        `/uploads/workshops/${req.file.filename}`,
      )
    }

    console.error('Create workshop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat workshop.',
      error:
        process.env.NODE_ENV === 'development'
          ? getErrorMessage(error)
          : undefined,
    })
  }
}

export async function updateWorkshop(
  req: WorkshopRequest<WorkshopParams, WorkshopBody>,
  res: Response,
): Promise<Response> {
  try {
    const workshop = await Workshop.findByPk(req.params.id)

    if (!workshop) {
      if (req.file) {
        deleteUploadedFile(
          `/uploads/workshops/${req.file.filename}`,
        )
      }

      return res.status(404).json({
        success: false,
        message: 'Workshop tidak ditemukan.',
      })
    }

    const {
      title,
      description,
      instructor,
      date,
      start_time,
      end_time,
      capacity,
      location,
      status,
    } = req.body

    const updateData: WorkshopUpdateData = {}

    if (title !== undefined) {
      updateData.title = title
    }

    if (description !== undefined) {
      updateData.description = description || null
    }

    if (instructor !== undefined) {
      updateData.instructor = instructor || null
    }

    if (date !== undefined) {
      updateData.date = date
    }

    if (start_time !== undefined) {
      updateData.start_time = start_time
    }

    if (end_time !== undefined) {
      updateData.end_time = end_time
    }

    if (capacity !== undefined && capacity !== '') {
      const parsedCapacity = Number(capacity)

      if (
        !Number.isInteger(parsedCapacity) ||
        parsedCapacity < 0
      ) {
        if (req.file) {
          deleteUploadedFile(
            `/uploads/workshops/${req.file.filename}`,
          )
        }

        return res.status(422).json({
          success: false,
          message:
            'Kapasitas workshop harus berupa angka yang valid.',
        })
      }

      updateData.capacity = parsedCapacity
    }

    if (location !== undefined) {
      updateData.location = location || null
    }

    if (status !== undefined) {
      updateData.status = status
    }

    if (req.file) {
      const newImage =
        `/uploads/workshops/${req.file.filename}`

      if (workshop.image) {
        deleteUploadedFile(workshop.image)
      }

      updateData.image = newImage
    }

    await workshop.update(updateData)

    return res.json({
      success: true,
      message: 'Workshop berhasil diperbarui.',
      data: workshop,
    })
  } catch (error: unknown) {
    if (req.file) {
      deleteUploadedFile(
        `/uploads/workshops/${req.file.filename}`,
      )
    }

    console.error('Update workshop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui workshop.',
      error:
        process.env.NODE_ENV === 'development'
          ? getErrorMessage(error)
          : undefined,
    })
  }
}

export async function deleteWorkshop(
  req: Request<WorkshopParams>,
  res: Response,
): Promise<Response> {
  try {
    const workshop = await Workshop.findByPk(req.params.id)

    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Workshop tidak ditemukan.',
      })
    }

    const oldImage = workshop.image

    await workshop.destroy()

    if (oldImage) {
      deleteUploadedFile(oldImage)
    }

    return res.json({
      success: true,
      message: 'Workshop berhasil dihapus.',
    })
  } catch (error: unknown) {
    console.error('Delete workshop error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus workshop.',
    })
  }
}

module.exports = {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
}