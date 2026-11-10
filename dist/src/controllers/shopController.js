"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShops = getShops;
exports.getShopById = getShopById;
exports.createShop = createShop;
exports.updateShop = updateShop;
exports.deleteShop = deleteShop;
const imageUpload_1 = require("../middleware/imageUpload");
const cloudinaryImage_1 = require("../utils/cloudinaryImage");
const validation_1 = require("../utils/validation");
const { Shop } = require('../models');
function parseIsActive(value) {
    return value === true || value === '1' || value === 'true' || value === 1;
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return 'Terjadi kesalahan database.';
}
// GET /api/shops
async function getShops(_req, res) {
    try {
        const shops = await Shop.findAll({
            order: [['id', 'ASC']],
        });
        return res.json({
            success: true,
            data: shops,
        });
    }
    catch (error) {
        console.error('Get shops error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data toko.',
            error: getErrorMessage(error),
        });
    }
}
// GET /api/shops/:id
async function getShopById(req, res) {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Toko tidak ditemukan.',
            });
        }
        return res.json({
            success: true,
            data: shop,
        });
    }
    catch (error) {
        console.error('Get shop detail error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail toko.',
            error: getErrorMessage(error),
        });
    }
}
// POST /api/shops
async function createShop(req, res) {
    const image = req.body?.image;
    if ((image !== undefined && image !== null && !(0, cloudinaryImage_1.isCloudinaryImageUrl)(image)) ||
        (req.file && image !== undefined)) {
        if (req.file) {
            (0, imageUpload_1.removeUploadedImage)('shops', req.file.filename);
        }
        return res.status(422).json({
            success: false,
            message: 'URL gambar Cloudinary tidak valid atau sumber gambar ganda.',
        });
    }
    try {
        const { name, description, instagram, tiktok, whatsapp, address, is_active, } = req.body;
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(422).json({
                success: false,
                message: 'Nama toko wajib diisi.',
            });
        }
        const normalizedWhatsApp = typeof whatsapp === 'string' && whatsapp.trim()
            ? whatsapp.trim()
            : null;
        const normalizedAddress = typeof address === 'string' && address.trim()
            ? address.trim()
            : null;
        if (whatsapp !== undefined &&
            whatsapp !== null &&
            (typeof whatsapp !== 'string' ||
                (whatsapp.trim() !== '' &&
                    !(0, validation_1.isValidIndonesianMobileNumber)(normalizedWhatsApp)))) {
            if (req.file) {
                (0, imageUpload_1.removeUploadedImage)('shops', req.file.filename);
            }
            return res.status(422).json({
                success: false,
                message: 'Nomor WhatsApp tidak valid. Gunakan nomor HP Indonesia, misalnya 081234567890 atau +6281234567890.',
            });
        }
        if (address !== undefined &&
            address !== null &&
            (typeof address !== 'string' ||
                (address.trim() !== '' && !(0, validation_1.isDetailedAddress)(normalizedAddress)))) {
            if (req.file) {
                (0, imageUpload_1.removeUploadedImage)('shops', req.file.filename);
            }
            return res.status(422).json({
                success: false,
                message: 'Alamat toko harus lebih detail (minimal 15 karakter dan 3 kata, sertakan nama jalan serta detail lokasi).',
            });
        }
        const shopData = {
            name: name.trim(),
            description: description || null,
            image: req.file
                ? `/uploads/shops/${req.file.filename}`
                : image ?? null,
            instagram: instagram || null,
            tiktok: tiktok || null,
            whatsapp: normalizedWhatsApp,
            address: normalizedAddress,
            is_active: is_active === undefined
                ? true
                : parseIsActive(is_active),
        };
        const shop = await Shop.create(shopData);
        return res.status(201).json({
            success: true,
            message: 'Toko berhasil dibuat.',
            data: shop,
        });
    }
    catch (error) {
        console.error('Create shop error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat toko.',
            error: getErrorMessage(error),
        });
    }
}
// PUT /api/shops/:id
async function updateShop(req, res) {
    const image = req.body?.image;
    if ((image !== undefined && image !== null && !(0, cloudinaryImage_1.isCloudinaryImageUrl)(image)) ||
        (req.file && image !== undefined)) {
        if (req.file) {
            (0, imageUpload_1.removeUploadedImage)('shops', req.file.filename);
        }
        return res.status(422).json({
            success: false,
            message: 'URL gambar Cloudinary tidak valid atau sumber gambar ganda.',
        });
    }
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Toko tidak ditemukan.',
            });
        }
        const { name, description, instagram, tiktok, whatsapp, address, is_active, } = req.body;
        const updateData = {};
        const normalizedWhatsApp = typeof whatsapp === 'string' && whatsapp.trim()
            ? whatsapp.trim()
            : null;
        const normalizedAddress = typeof address === 'string' && address.trim()
            ? address.trim()
            : null;
        if (whatsapp !== undefined &&
            whatsapp !== null &&
            (typeof whatsapp !== 'string' ||
                (whatsapp.trim() !== '' &&
                    !(0, validation_1.isValidIndonesianMobileNumber)(normalizedWhatsApp)))) {
            if (req.file) {
                (0, imageUpload_1.removeUploadedImage)('shops', req.file.filename);
            }
            return res.status(422).json({
                success: false,
                message: 'Nomor WhatsApp tidak valid. Gunakan nomor HP Indonesia, misalnya 081234567890 atau +6281234567890.',
            });
        }
        if (address !== undefined &&
            address !== null &&
            (typeof address !== 'string' ||
                (address.trim() !== '' && !(0, validation_1.isDetailedAddress)(normalizedAddress)))) {
            if (req.file) {
                (0, imageUpload_1.removeUploadedImage)('shops', req.file.filename);
            }
            return res.status(422).json({
                success: false,
                message: 'Alamat toko harus lebih detail (minimal 15 karakter dan 3 kata, sertakan nama jalan serta detail lokasi).',
            });
        }
        if (name !== undefined) {
            if (typeof name !== 'string' || !name.trim()) {
                return res.status(422).json({
                    success: false,
                    message: 'Nama toko wajib diisi.',
                });
            }
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (instagram !== undefined) {
            updateData.instagram = instagram;
        }
        if (tiktok !== undefined) {
            updateData.tiktok = tiktok;
        }
        if (whatsapp !== undefined) {
            updateData.whatsapp = normalizedWhatsApp;
        }
        if (address !== undefined) {
            updateData.address = normalizedAddress;
        }
        if (is_active !== undefined) {
            updateData.is_active = parseIsActive(is_active);
        }
        if (req.file) {
            updateData.image = `/uploads/shops/${req.file.filename}`;
        }
        else if (image !== undefined) {
            updateData.image = image;
        }
        await shop.update(updateData);
        return res.json({
            success: true,
            message: 'Toko berhasil diperbarui.',
            data: shop,
        });
    }
    catch (error) {
        console.error('Update shop error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui toko.',
            error: getErrorMessage(error),
        });
    }
}
// DELETE /api/shops/:id
async function deleteShop(req, res) {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Toko tidak ditemukan.',
            });
        }
        await shop.destroy();
        return res.json({
            success: true,
            message: 'Toko berhasil dihapus.',
        });
    }
    catch (error) {
        console.error('Delete shop error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus toko.',
            error: getErrorMessage(error),
        });
    }
}
