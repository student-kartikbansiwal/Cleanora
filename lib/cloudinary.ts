import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

export async function uploadToCloudinary(
  fileUri: string,
  folder: string = "cleanora"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileUri, {
    folder,
    resource_type: "auto",
    quality: "auto",
    fetch_format: "auto",
    flags: "progressive",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
