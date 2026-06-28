import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

/**
 * Upload a base64 data-URI (e.g. "data:image/png;base64,....") to Cloudinary.
 * Returns the secure URL of the uploaded asset.
 */
export async function uploadDataUri(dataUri, folder = 'kashika/kyc') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Add CLOUDINARY_* credentials to .env')
  }
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  })
  return res.secure_url
}

export default cloudinary
