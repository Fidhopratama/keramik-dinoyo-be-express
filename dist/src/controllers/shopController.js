"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShops = getShops;
exports.getShopById = getShopById;
exports.createShop = createShop;
exports.updateShop = updateShop;
exports.deleteShop = deleteShop;
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
    try {
        const { name, description, instagram, tiktok, whatsapp, address, is_active, } = req.body;
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(422).json({
                success: false,
                message: 'Nama toko wajib diisi.',
            });
        }
        const image = req.file
            ? `/uploads/shops/${req.file.filename}`
            : null;
        const shop = await Shop.create({
            name: name.trim(),
            description: description || null,
            image,
            instagram: instagram || null,
            tiktok: tiktok || null,
            whatsapp: whatsapp || null,
            address: address || null,
            is_active: is_active === undefined
                ? true
                : parseIsActive(is_active),
        });
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
            updateData.whatsapp = whatsapp;
        }
        if (address !== undefined) {
            updateData.address = address;
        }
        if (is_active !== undefined) {
            updateData.is_active = parseIsActive(is_active);
        }
        if (req.file) {
            updateData.image = `/uploads/shops/${req.file.filename}`;
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
