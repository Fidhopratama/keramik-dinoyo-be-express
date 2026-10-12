const fs = require('fs')
const path = require('path')
const { Workshop } = require('../models')

function deleteUploadedFile(imagePath) {
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
  } catch (error) {
    console.error('Delete workshop image error:', error)
  }
}

function getImagePath(req) {
  if (!req.file) return null

  return `/uploads/workshops/${req.file.filename}`
}

async function getWorkshops(req, res) {
  try {
    const workshops = await Workshop.findAll({
      order: [['id', 'ASC']],
    })

    return res.json({
      success: true,
      data: workshops,
    })
  } catch (error) {
    console.error('Get workshops error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data workshop.',
    })
  }
}

async function getWorkshopById(req, res) {
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
  } catch (error) {
    console.error('Get workshop detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail workshop.',
    })
  }
}

async function createWorkshop(req, res) {
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
  } catch (error) {
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
          ? error.message
          : undefined,
    })
  }
}

async function updateWorkshop(req, res) {
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

    const updateData = {}

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
  } catch (error) {
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
          ? error.message
          : undefined,
    })
  }
}

async function deleteWorkshop(req, res) {
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
  } catch (error) {
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