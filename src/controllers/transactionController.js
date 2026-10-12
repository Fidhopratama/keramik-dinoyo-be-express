const {
  Transaction,
  TransactionItem,
  Product,
  User,
} = require('../models')

async function getTransactions(req, res) {
  try {
    const where = {}

    // Customer hanya boleh melihat transaksi miliknya sendiri.
    if (req.user.role !== 'admin') {
      where.user_id = req.user.userId
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'image'],
            },
          ],
        },
      ],
      order: [['id', 'DESC']],
    })

    return res.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    console.error('Get transactions error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data transaksi.',
    })
  }
}

async function getTransactionById(req, res) {
  try {
    const where = {
      id: req.params.id,
    }

    // Customer hanya boleh melihat transaksi miliknya.
    if (req.user.role !== 'admin') {
      where.user_id = req.user.userId
    }

    const transaction = await Transaction.findOne({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'image'],
            },
          ],
        },
      ],
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan.',
      })
    }

    return res.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error('Get transaction detail error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail transaksi.',
    })
  }
}

async function createTransaction(req, res) {
  const transactionDb = await Transaction.sequelize.transaction()

  try {
    const {
      user_id,
      transaction_code,
      payment_method,
      shipping_address,
      notes,
      items,
    } = req.body

    if (!transaction_code || !Array.isArray(items) || items.length === 0) {
      await transactionDb.rollback()

      return res.status(422).json({
        success: false,
        message: 'Kode transaksi dan minimal satu item wajib diisi.',
      })
    }

    const existingTransaction = await Transaction.findOne({
      where: {
        transaction_code,
      },
    })

    if (existingTransaction) {
      await transactionDb.rollback()

      return res.status(422).json({
        success: false,
        message: 'Kode transaksi sudah digunakan.',
      })
    }

    // Customer otomatis menggunakan user_id dari JWT.
    // Admin boleh menentukan user_id secara manual.
    const transactionUserId =
      req.user.role === 'admin'
        ? user_id || null
        : req.user.userId

    if (transactionUserId) {
      const user = await User.findByPk(transactionUserId)

      if (!user) {
        await transactionDb.rollback()

        return res.status(422).json({
          success: false,
          message: 'User tidak ditemukan.',
        })
      }
    }

    let totalAmount = 0
    const preparedItems = []

    for (const item of items) {
      if (
        !item.product_id ||
        !item.quantity ||
        item.quantity <= 0
      ) {
        await transactionDb.rollback()

        return res.status(422).json({
          success: false,
          message:
            'Setiap item harus memiliki product_id dan quantity yang valid.',
        })
      }

      const product = await Product.findByPk(item.product_id)

      if (!product) {
        await transactionDb.rollback()

        return res.status(422).json({
          success: false,
          message: `Produk dengan ID ${item.product_id} tidak ditemukan.`,
        })
      }

      const price = Number(product.price)
      const quantity = Number(item.quantity)
      const subtotal = price * quantity

      totalAmount += subtotal

      preparedItems.push({
        product_id: product.id,
        product_name: product.name,
        price,
        quantity,
        subtotal,
      })
    }

    const transaction = await Transaction.create(
      {
        user_id: transactionUserId,
        transaction_code,
        total_amount: totalAmount,
        status: 'pending',
        payment_method: payment_method || null,
        shipping_address: shipping_address || null,
        notes: notes || null,
      },
      {
        transaction: transactionDb,
      },
    )

    for (const item of preparedItems) {
      await TransactionItem.create(
        {
          transaction_id: transaction.id,
          ...item,
        },
        {
          transaction: transactionDb,
        },
      )
    }

    await transactionDb.commit()

    const createdTransaction = await Transaction.findByPk(
      transaction.id,
      {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: TransactionItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: [
                  'id',
                  'name',
                  'slug',
                  'image',
                ],
              },
            ],
          },
        ],
      },
    )

    return res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat.',
      data: createdTransaction,
    })
  } catch (error) {
    await transactionDb.rollback()

    console.error('Create transaction error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat transaksi.',
    })
  }
}

async function updateTransaction(req, res) {
  try {
    const transaction = await Transaction.findByPk(
      req.params.id,
    )

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan.',
      })
    }

    const {
      status,
      payment_method,
      shipping_address,
      notes,
    } = req.body

    await transaction.update({
      ...(status !== undefined && { status }),
      ...(payment_method !== undefined && {
        payment_method,
      }),
      ...(shipping_address !== undefined && {
        shipping_address,
      }),
      ...(notes !== undefined && {
        notes,
      }),
    })

    return res.json({
      success: true,
      message: 'Transaksi berhasil diperbarui.',
      data: transaction,
    })
  } catch (error) {
    console.error('Update transaction error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui transaksi.',
    })
  }
}

async function deleteTransaction(req, res) {
  const transactionDb = await Transaction.sequelize.transaction()

  try {
    const transaction = await Transaction.findByPk(
      req.params.id,
    )

    if (!transaction) {
      await transactionDb.rollback()

      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan.',
      })
    }

    await TransactionItem.destroy({
      where: {
        transaction_id: transaction.id,
      },
      transaction: transactionDb,
    })

    await transaction.destroy({
      transaction: transactionDb,
    })

    await transactionDb.commit()

    return res.json({
      success: true,
      message: 'Transaksi berhasil dihapus.',
    })
  } catch (error) {
    await transactionDb.rollback()

    console.error('Delete transaction error:', error)

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus transaksi.',
    })
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
}