
import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { imageUploadErrorHandler } from './middleware/imageUpload'
import frontendCors from './middleware/frontendCors'

dotenv.config()

const authRoutes = require('./routes/authRoutes')
const cloudinaryUploadRoutes = require('./routes/cloudinaryUploadRoutes')
const shopRoutes = require('./routes/shopRoutes')
const productRoutes = require('./routes/productRoutes')
const workshopRoutes = require('./routes/workshopRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const aiAnalysisRoutes = require('./routes/aiAnalysisRoutes')
const auditLogRoutes = require('./routes/auditLogRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const categoryRoutes = require('./routes/categoryRoutes')

const app = express()

app.use(frontendCors)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  '/uploads',
  express.static(
    path.join(process.cwd(), 'uploads'),
  ),
)

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Keramik Dinoyo API berjalan.',
  })
})

app.use('/api', authRoutes)
app.use('/api', cloudinaryUploadRoutes)
app.use('/api', shopRoutes)
app.use('/api', productRoutes)
app.use('/api', workshopRoutes)
app.use('/api', transactionRoutes)
app.use('/api', reviewRoutes)
app.use('/api', aiAnalysisRoutes)
app.use('/api', auditLogRoutes)
app.use('/api', dashboardRoutes)
app.use('/api', categoryRoutes)

app.use(imageUploadErrorHandler)

module.exports = app