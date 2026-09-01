import cloudinary from "../config/cloudinary.js";

const detectImageFormat = (buffer) => {
  if (!buffer || buffer.length < 8) {
    return null;
  }

  if (
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  if (
    buffer.length >= 6 &&
    buffer.toString("ascii", 0, 6) === "GIF87a"
  ) {
    return "gif";
  }

  if (
    buffer.length >= 6 &&
    buffer.toString("ascii", 0, 6) === "GIF89a"
  ) {
    return "gif";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return null;
};

export const uploadToCloudinary = async (
  fileBuffer,
  mimetype,
  folder = "KhanaExpress",
) => {
  try {
    const imageFormat = detectImageFormat(fileBuffer);

    if (!imageFormat) {
      throw new Error("Unsupported image file signature");
    }

    const base64String = `data:image/${imageFormat};base64,${fileBuffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to cloud storage");
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image from cloud storage");
  }
};
