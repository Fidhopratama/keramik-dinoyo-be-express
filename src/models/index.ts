const Role = require('./Role')
const User = require('./User')
const Shop = require('./Shop')
const Product = require('./Product')
const Category = require('./Category')
const Workshop = require('./Workshop')
const Transaction = require('./Transaction')
const TransactionItem = require('./TransactionItem')
const Review = require('./Review')
const AiAnalysisResult = require('./AiAnalysisResult')
const AuditLog = require('./AuditLog')

// User ↔ Role
Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users',
})

User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
})

// Shop ↔ Product
Shop.hasMany(Product, {
  foreignKey: 'shop_id',
  as: 'products',
})

Product.belongsTo(Shop, {
  foreignKey: 'shop_id',
  as: 'shop',
})

// Category ↔ Product
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
})

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
})

// User ↔ Transaction
User.hasMany(Transaction, {
  foreignKey: 'user_id',
  as: 'transactions',
})

Transaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// Transaction ↔ TransactionItem
Transaction.hasMany(TransactionItem, {
  foreignKey: 'transaction_id',
  as: 'items',
})

TransactionItem.belongsTo(Transaction, {
  foreignKey: 'transaction_id',
  as: 'transaction',
})

// Product ↔ TransactionItem
Product.hasMany(TransactionItem, {
  foreignKey: 'product_id',
  as: 'transactionItems',
})

TransactionItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
})

// User ↔ Review
User.hasMany(Review, {
  foreignKey: 'user_id',
  as: 'reviews',
})

Review.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// Product ↔ Review
Product.hasMany(Review, {
  foreignKey: 'product_id',
  as: 'reviews',
})

Review.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
})

// User ↔ AI Analysis Result
User.hasMany(AiAnalysisResult, {
  foreignKey: 'user_id',
  as: 'aiAnalysisResults',
})

AiAnalysisResult.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// User ↔ Audit Log
User.hasMany(AuditLog, {
  foreignKey: 'user_id',
  as: 'auditLogs',
})

AuditLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

module.exports = {
  Role,
  User,
  Shop,
  Product,
  Category,
  Workshop,
  Transaction,
  TransactionItem,
  Review,
  AiAnalysisResult,
  AuditLog,
}