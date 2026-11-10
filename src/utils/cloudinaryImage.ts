export function isCloudinaryImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  if (!cloudName || !/^[a-zA-Z0-9_-]+$/.test(cloudName)) return false

  try {
    const url = new URL(value)
    const imagePath = `/${cloudName}/image/upload/`

    return (
      url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      url.username === '' &&
      url.password === '' &&
      url.port === '' &&
      url.search === '' &&
      url.hash === '' &&
      url.pathname.startsWith(imagePath) &&
      url.pathname.length > imagePath.length
    )
  } catch {
    return false
  }
}
