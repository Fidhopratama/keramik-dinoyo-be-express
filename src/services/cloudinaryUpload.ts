import { randomUUID } from 'node:crypto'
import { v2 as cloudinary } from 'cloudinary'

export const CLOUDINARY_FOLDER = 'keramik-dinoyo'
export const CLOUDINARY_UPLOAD_PRESET = 'keramik-dinoyo-uploads'
export const CLOUDINARY_ALLOWED_FORMATS = 'jpg,jpeg,png,webp'

export class CloudinaryConfigurationError extends Error {}

export interface CloudinaryUploadSignature {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  publicId: string
}

export function getCloudinaryCredentials(): {
  cloudName: string
  apiKey: string
  apiSecret: string
} {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

  if (
    !cloudName ||
    !/^[a-zA-Z0-9_-]+$/.test(cloudName) ||
    !apiKey ||
    !apiSecret
  ) {
    throw new CloudinaryConfigurationError(
      'Konfigurasi Cloudinary belum tersedia atau tidak valid.',
    )
  }

  return { cloudName, apiKey, apiSecret }
}

export function createCloudinaryUploadSignature(
  timestamp = Math.floor(Date.now() / 1000),
  publicId = randomUUID(),
): CloudinaryUploadSignature {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials()
  const paramsToSign = {
    folder: CLOUDINARY_FOLDER,
    allowed_formats: CLOUDINARY_ALLOWED_FORMATS,
    public_id: publicId,
    timestamp,
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
  }

  return {
    cloudName,
    apiKey,
    timestamp,
    signature: cloudinary.utils.api_sign_request(paramsToSign, apiSecret),
    folder: CLOUDINARY_FOLDER,
    publicId,
  }
}
