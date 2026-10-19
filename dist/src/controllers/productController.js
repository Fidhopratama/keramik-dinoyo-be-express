"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const sequelize_1 = require("sequelize");
const { Product, Shop, Category } = require('../models');
function makeSlug(value) {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function getProductImagePath(file) {
    if (!file) {
        return null;
    }
    return `products/${file.filename}`;
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return 'Terjadi kesalahan database.';
}
// GET /api/products
const getProducts = async (req, res) => {
    try {
        const { search, shop_id, category_id, status } = req.query;
        const where = {};
        if (search) {
            Object.assign(where, {
                [sequelize_1.Op.or]: [
                    { name: { [sequelize_1.Op.like]: `%${search}%` } },
                    { description: { [sequelize_1.Op.like]: `%${search}%` } },
                ],
            });
        }
        if (shop_id)
            Object.assign(where, { shop_id });
        if (category_id)
            Object.assign(where, { category_id });
        if (status)
            Object.assign(where, { status });
        const products = await Product.findAll({
            where,
            include: [
                {
                    model: Shop,
                    as: 'shop',
                    attributes: ['id', 'name'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['id', 'DESC']],
        });
        return res.json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        console.error('getProducts error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data produk.',
            error: getErrorMessage(error),
        });
    }
};
exports.getProducts = getProducts;
// GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: Shop,
                    as: 'shop',
                    attributes: ['id', 'name'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.',
            });
        }
        return res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error('getProductById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail produk.',
            error: getErrorMessage(error),
        });
    }
};
exports.getProductById = getProductById;
// POST /api/products
const createProduct = async (req, res) => {
    try {
        const { shop_id, category_id, name, slug, description, price, stock, status, } = req.body;
        if (!shop_id ||
            typeof name !== 'string' ||
            !name.trim() ||
            price === undefined ||
            price === null ||
            price === '') {
            return res.status(422).json({
                success: false,
                message: 'shop_id, name, dan price wajib diisi.',
            });
        }
        const shop = await Shop.findByPk(shop_id);
        if (!shop) {
            return res.status(422).json({
                success: false,
                message: 'Toko tidak ditemukan.',
            });
        }
        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(422).json({
                    success: false,
                    message: 'Kategori tidak ditemukan.',
                });
            }
        }
        const finalSlug = slug?.trim() || makeSlug(name);
        const existingSlug = await Product.findOne({
            where: { slug: finalSlug },
        });
        if (existingSlug) {
            return res.status(422).json({
                success: false,
                message: 'Slug produk sudah digunakan.',
            });
        }
        const image = getProductImagePath(req.file);
        const product = await Product.create({
            shop_id,
            category_id: category_id || null,
            name,
            slug: finalSlug,
            description: description || null,
            price,
            stock: stock !== undefined && stock !== '' ? stock : 0,
            image,
            status: status || 'active',
        });
        const result = await Product.findByPk(product.id, {
            include: [
                {
                    model: Shop,
                    as: 'shop',
                    attributes: ['id', 'name'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });
        return res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan.',
            data: result,
        });
    }
    catch (error) {
        console.error('createProduct error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menambahkan produk.',
            error: getErrorMessage(error),
        });
    }
};
exports.createProduct = createProduct;
// PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.',
            });
        }
        const { shop_id, category_id, name, slug, description, price, stock, status, } = req.body;
        if (!shop_id ||
            typeof name !== 'string' ||
            !name.trim() ||
            price === undefined ||
            price === null ||
            price === '') {
            return res.status(422).json({
                success: false,
                message: 'shop_id, name, dan price wajib diisi.',
            });
        }
        const shop = await Shop.findByPk(shop_id);
        if (!shop) {
            return res.status(422).json({
                success: false,
                message: 'Toko tidak ditemukan.',
            });
        }
        if (category_id) {
            const category = await Category.findByPk(category_id);
            if (!category) {
                return res.status(422).json({
                    success: false,
                    message: 'Kategori tidak ditemukan.',
                });
            }
        }
        const finalSlug = slug?.trim() || makeSlug(name);
        const existingSlug = await Product.findOne({
            where: { slug: finalSlug },
        });
        if (existingSlug && existingSlug.id !== product.id) {
            return res.status(422).json({
                success: false,
                message: 'Slug produk sudah digunakan.',
            });
        }
        const updateData = {
            shop_id,
            category_id: category_id || null,
            name,
            slug: finalSlug,
            description: description || null,
            price,
            stock: stock !== undefined && stock !== '' ? stock : 0,
            status: status || 'active',
        };
        if (req.file) {
            updateData.image = getProductImagePath(req.file);
        }
        await product.update(updateData);
        const result = await Product.findByPk(product.id, {
            include: [
                {
                    model: Shop,
                    as: 'shop',
                    attributes: ['id', 'name'],
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
        });
        return res.json({
            success: true,
            message: 'Produk berhasil diperbarui.',
            data: result,
        });
    }
    catch (error) {
        console.error('updateProduct error:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui produk.',
            error: getErrorMessage(error),
        });
    }
};
exports.updateProduct = updateProduct;
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.',
            });
        }
        await product.destroy();
        return res.json({
            success: true,
            message: 'Produk berhasil dihapus.',
        });
    }
    catch (error) {
        console.error('deleteProduct error:', error);
        const dbError = error;
        const errorMessage = dbError.parent?.sqlMessage ||
            dbError.original?.sqlMessage ||
            getErrorMessage(error);
        if (errorMessage.toLowerCase().includes('foreign key')) {
            return res.status(409).json({
                success: false,
                message: 'Produk tidak bisa dihapus karena masih digunakan oleh data lain.',
                error: errorMessage,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus produk.',
            error: errorMessage,
        });
    }
};
exports.deleteProduct = deleteProduct;
