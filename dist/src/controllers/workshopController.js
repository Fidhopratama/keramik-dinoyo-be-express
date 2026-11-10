"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkshops = getWorkshops;
exports.getWorkshopById = getWorkshopById;
exports.createWorkshop = createWorkshop;
exports.updateWorkshop = updateWorkshop;
exports.deleteWorkshop = deleteWorkshop;
const fs = require('fs');
const path = require('path');
const { Workshop } = require('../models');
const imageUpload_1 = require("../middleware/imageUpload");
const validation_1 = require("../utils/validation");
const cloudinaryImage_1 = require("../utils/cloudinaryImage");
function deleteUploadedFile(imagePath) {
    if (!imagePath)
        return;
    const normalized = imagePath.replace(/^\/+/, '');
    if (!normalized.startsWith('uploads/workshops/')) {
        return;
    }
    const filePath = path.join(process.cwd(), normalized);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error('Delete workshop image error:', error);
    }
}
function getImagePath(req) {
    if (!req.file)
        return null;
    return `/uploads/workshops/${req.file.filename}`;
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return 'Terjadi kesalahan.';
}
async function getWorkshops(_req, res) {
    try {
        const workshops = await Workshop.findAll({
            order: [['id', 'ASC']],
        });
        return res.json({
            success: true,
            data: workshops,
        });
    }
    catch (error) {
        console.error('Get workshops error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data workshop.',
        });
    }
}
async function getWorkshopById(req, res) {
    try {
        const workshop = await Workshop.findByPk(req.params.id);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop tidak ditemukan.',
            });
        }
        return res.json({
            success: true,
            data: workshop,
        });
    }
    catch (error) {
        console.error('Get workshop detail error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail workshop.',
        });
    }
}
async function createWorkshop(req, res) {
    const image = req.body?.image;
    if ((image !== undefined && image !== null && !(0, cloudinaryImage_1.isCloudinaryImageUrl)(image)) ||
        (req.file && image !== undefined)) {
        if (req.file) {
            (0, imageUpload_1.removeUploadedImage)('workshops', req.file.filename);
        }
        return res.status(422).json({
            success: false,
            message: 'URL gambar Cloudinary tidak valid atau sumber gambar ganda.',
        });
    }
    try {
        const { title, description, instructor, date, start_time, end_time, capacity, location, status, } = req.body;
        if (!title || !date || !start_time || !end_time) {
            if (req.file) {
                deleteUploadedFile(`/uploads/workshops/${req.file.filename}`);
            }
            return res.status(422).json({
                success: false,
                message: 'Judul, tanggal, waktu mulai, dan waktu selesai wajib diisi.',
            });
        }
        if (location !== undefined &&
            location !== null &&
            location !== '' &&
            !(0, validation_1.isDetailedAddress)(location)) {
            if (req.file) {
                (0, imageUpload_1.removeUploadedImage)('workshops', req.file.filename);
            }
            return res.status(422).json({
                success: false,
                message: 'Lokasi workshop harus lebih detail (minimal 15 karakter dan 3 kata, sertakan nama jalan serta detail lokasi).',
            });
        }
        const parsedCapacity = capacity === undefined || capacity === ''
            ? 20
            : Number(capacity);
        if (!Number.isInteger(parsedCapacity) ||
            parsedCapacity < 0) {
            if (req.file) {
                deleteUploadedFile(`/uploads/workshops/${req.file.filename}`);
            }
            return res.status(422).json({
                success: false,
                message: 'Kapasitas workshop harus berupa angka yang valid.',
            });
        }
        const workshopData = {
            title,
            description: description || null,
            instructor: instructor || null,
            date,
            start_time,
            end_time,
            capacity: parsedCapacity,
            location: typeof location === 'string' && location.trim()
                ? location.trim()
                : null,
            image: req.file ? getImagePath(req) : image ?? null,
            status: status || 'upcoming',
        };
        const workshop = await Workshop.create(workshopData);
        return res.status(201).json({
            success: true,
            message: 'Workshop berhasil dibuat.',
            data: workshop,
        });
    }
    catch (error) {
        if (req.file) {
            deleteUploadedFile(`/uploads/workshops/${req.file.filename}`);
        }
        console.error('Create workshop error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat workshop.',
            error: process.env.NODE_ENV === 'development'
                ? getErrorMessage(error)
                : undefined,
        });
    }
}
async function updateWorkshop(req, res) {
    const image = req.body?.image;
    if ((image !== undefined && image !== null && !(0, cloudinaryImage_1.isCloudinaryImageUrl)(image)) ||
        (req.file && image !== undefined)) {
        if (req.file) {
            (0, imageUpload_1.removeUploadedImage)('workshops', req.file.filename);
        }
        return res.status(422).json({
            success: false,
            message: 'URL gambar Cloudinary tidak valid atau sumber gambar ganda.',
        });
    }
    try {
        const workshop = await Workshop.findByPk(req.params.id);
        if (!workshop) {
            if (req.file) {
                deleteUploadedFile(`/uploads/workshops/${req.file.filename}`);
            }
            return res.status(404).json({
                success: false,
                message: 'Workshop tidak ditemukan.',
            });
        }
        const { title, description, instructor, date, start_time, end_time, capacity, location, status, } = req.body;
        const updateData = {};
        if (title !== undefined) {
            updateData.title = title;
        }
        if (description !== undefined) {
            updateData.description = description || null;
        }
        if (instructor !== undefined) {
            updateData.instructor = instructor || null;
        }
        if (date !== undefined) {
            updateData.date = date;
        }
        if (start_time !== undefined) {
            updateData.start_time = start_time;
        }
        if (end_time !== undefined) {
            updateData.end_time = end_time;
        }
        if (capacity !== undefined && capacity !== '') {
            const parsedCapacity = Number(capacity);
            if (!Number.isInteger(parsedCapacity) ||
                parsedCapacity < 0) {
                if (req.file) {
                    deleteUploadedFile(`/uploads/workshops/${req.file.filename}`);
                }
                return res.status(422).json({
                    success: false,
                    message: 'Kapasitas workshop harus berupa angka yang valid.',
                });
            }
            updateData.capacity = parsedCapacity;
        }
        if (location !== undefined) {
            if (location === null || location === '') {
                updateData.location = null;
            }
            else if ((0, validation_1.isDetailedAddress)(location)) {
                updateData.location = location.trim();
            }
            else {
                if (req.file) {
                    (0, imageUpload_1.removeUploadedImage)('workshops', req.file.filename);
                }
                return res.status(422).json({
                    success: false,
                    message: 'Lokasi workshop harus lebih detail (minimal 15 karakter dan 3 kata, sertakan nama jalan serta detail lokasi).',
                });
            }
        }
        if (status !== undefined) {
            updateData.status = status;
        }
        if (req.file) {
            const newImage = `/uploads/workshops/${req.file.filename}`;
            updateData.image = newImage;
        }
        else if (image !== undefined) {
            updateData.image = image;
        }
        await workshop.update(updateData);
        return res.json({
            success: true,
            message: 'Workshop berhasil diperbarui.',
            data: workshop,
        });
    }
    catch (error) {
        if (req.file) {
            deleteUploadedFile(`/uploads/workshops/${req.file.filename}`);
        }
        console.error('Update workshop error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui workshop.',
            error: process.env.NODE_ENV === 'development'
                ? getErrorMessage(error)
                : undefined,
        });
    }
}
async function deleteWorkshop(req, res) {
    try {
        const workshop = await Workshop.findByPk(req.params.id);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                message: 'Workshop tidak ditemukan.',
            });
        }
        const oldImage = workshop.image;
        await workshop.destroy();
        if (oldImage) {
            deleteUploadedFile(oldImage);
        }
        return res.json({
            success: true,
            message: 'Workshop berhasil dihapus.',
        });
    }
    catch (error) {
        console.error('Delete workshop error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus workshop.',
        });
    }
}
module.exports = {
    getWorkshops,
    getWorkshopById,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
};
