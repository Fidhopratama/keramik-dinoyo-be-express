
import type { Request, Response } from 'express'
import type { Transaction as SequelizeTransaction } from 'sequelize'

const { Transaction, TransactionItem, Product, User } = require('../models')
const { sequelize } = require('../config/database')

interface TransactionParams {
  id: string
}

interface TransactionItemInput {
  product_id?: number | string
  quantity?: number | string
}

interface TransactionBody {
  user_id?: number | string | null
  transaction_code?: string
  payment_method?: string | null
  shipping_address?: string | null
  notes?: string | null
  items?: TransactionItemInput[]
  status?: string
}

interface AuthenticatedUser {
  userId: number
  role?: string
}

interface AuthenticatedRequest<
  P = Record<string, never>,
  B = unknown,
> extends Request<P, unknown, B> {
  user: AuthenticatedUser
}

interface PreparedItem {
  product_id: number | string
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

interface TransactionUpdateData {
  status?: string
  payment_method?: string | null
  shipping_address?: string | null
  notes?: string | null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Terjadi kesalahan database.'
}

export async function getTransactions(
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> {
  try {
    const where: Record<string, unknown> = {}

    if (req.user.role !== 'admin') {
      where.user_id = req.user.userId
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TransactionItem,
          include: [Product],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return res.status(200).json({
      success: true,
      data: transactions,
    })
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    })
  }
}

export async function getTransactionById(
  req: AuthenticatedRequest<TransactionParams>,
  res: Response,
): Promise<Response> {
  try {
    const { id } = req.params

    const where: Record<string, unknown> = { id }

    if (req.user.role !== 'admin') {
      where.user_id = req.user.userId
    }

    const transaction = await Transaction.findOne({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TransactionItem,
          include: [Product],
        },
      ],
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan.',
      })
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    })
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    })
  }
}

export async function createTransaction(
  req: AuthenticatedRequest<Record<string, never>, TransactionBody>,
  res: Response,
): Promise<Response> {
  let transactionDb: SequelizeTransaction | undefined

  try {
    const {
      user_id,
      transaction_code,
      payment_method,
      shipping_address,
      notes,
      items,
    } = req.body

    if (!transaction_code || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Kode transaksi dan item transaksi wajib diisi.',
      })
    }

    const dbTransaction: SequelizeTransaction =
      await sequelize.transaction()

    transactionDb = dbTransaction

    const existingTransaction = await Transaction.findOne({
      where: { transaction_code },
      transaction: dbTransaction,
    })

    if (existingTransaction) {
      await dbTransaction.rollback()
      transactionDb = undefined

      return res.status(409).json({
        success: false,
        message: 'Kode transaksi sudah digunakan.',
      })
    }

    const transactionUserId =
      req.user.role === 'admin' && user_id != null
        ? user_id
        : req.user.userId

    const user = await User.findByPk(transactionUserId, {
      transaction: dbTransaction,
    })

    if (!user) {
      await dbTransaction.rollback()
      transactionDb = undefined

      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      })
    }

    const preparedItems: PreparedItem[] = []
    let total = 0

    for (const item of items) {
      const productId = item.product_id
      const quantity = Number(item.quantity)

      if (
        productId == null ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await dbTransaction.rollback()
        transactionDb = undefined

        return res.status(400).json({
          success: false,
          message: 'Produk dan jumlah item tidak valid.',
        })
      }

      const product = await Product.findByPk(productId, {
        transaction: dbTransaction,
      })

      if (!product) {
        await dbTransaction.rollback()
        transactionDb = undefined

        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${productId} tidak ditemukan.`,
        })
      }

      const price = Number(product.price)

      if (!Number.isFinite(price) || price < 0) {
        await dbTransaction.rollback()
        transactionDb = undefined

        return res.status(400).json({
          success: false,
          message: 'Harga produk tidak valid.',
        })
      }

      const subtotal = price * quantity
      total += subtotal

      preparedItems.push({
        product_id: productId,
        product_name: product.name,
        price,
        quantity,
        subtotal,
      })
    }

    const newTransaction = await Transaction.create(
      {
        user_id: transactionUserId,
        transaction_code,
        payment_method: payment_method ?? null,
        shipping_address: shipping_address ?? null,
        notes: notes ?? null,
        total,
        status: 'pending',
      },
      {
        transaction: dbTransaction,
      },
    )

    for (const item of preparedItems) {
      await TransactionItem.create(
        {
          transaction_id: newTransaction.id,
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        },
        {
          transaction: dbTransaction,
        },
      )
    }

    await dbTransaction.commit()
    transactionDb = undefined

    const createdTransaction = await Transaction.findByPk(
      newTransaction.id,
      {
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
          },
          {
            model: TransactionItem,
            include: [Product],
          },
        ],
      },
    )

    return res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat.',
      data: createdTransaction,
    })
  } catch (error: unknown) {
    if (transactionDb) {
      try {
        await transactionDb.rollback()
      } catch {
        // Transaksi mungkin sudah di-commit atau di-rollback.
      }
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    })
  }
}

export async function updateTransaction(
  req: AuthenticatedRequest<TransactionParams, TransactionBody>,
  res: Response,
): Promise<Response> {
  try {
    const { id } = req.params
    const {
      status,
      payment_method,
      shipping_address,
      notes,
    } = req.body

    const transaction = await Transaction.findByPk(id)

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan.',
      })
    }

    const updateData: TransactionUpdateData = {}

    if (status !== undefined) {
      updateData.status = status
    }

    if (payment_method !== undefined) {
      updateData.payment_method = payment_method
    }

    if (shipping_address !== undefined) {
      updateData.shipping_address = shipping_address
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    await transaction.update(updateData)

    return res.status(200).json({
      success: true,
      message: 'Transaksi berhasil diperbarui.',
      data: transaction,
    })
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    })
  }
}

export async function deleteTransaction(
  req: AuthenticatedRequest<TransactionParams>,
  res: Response,
): Promise<Response> {
  let transactionDb: SequelizeTransaction | undefined

  try {
    const { id } = req.params

    const dbTransaction: SequelizeTransaction =
      await sequelize.transaction()

    transactionDb = dbTransaction

    const transaction = await Transaction.findByPk(id, {
      transaction: dbTransaction,
    })

    if (!transaction) {
      await dbTransaction.rollback()
      transactionDb = undefined

      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan.',
      })
    }

    await TransactionItem.destroy({
      where: { transaction_id: id },
      transaction: dbTransaction,
    })

    await transaction.destroy({
      transaction: dbTransaction,
    })

    await dbTransaction.commit()
    transactionDb = undefined

    return res.status(200).json({
      success: true,
      message: 'Transaksi berhasil dihapus.',
    })
  } catch (error: unknown) {
    if (transactionDb) {
      try {
        await transactionDb.rollback()
      } catch {
        // Transaksi mungkin sudah di-commit atau di-rollback.
      }
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error),
    })
  }
}