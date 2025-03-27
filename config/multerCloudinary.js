import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dxlcaoneq",
  api_key: "194621958231153",
  api_secret: "RihEwpmXvaH6CM9uACo17Q6fOo4",
});

// Cloudinary storage for class images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "yoga-class-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1000, height: 750, crop: "fill" },
      { quality: "auto" },
    ],
    public_id: (req, file) => `class-${Date.now()}`,
  },
});

// Cloudinary storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "yoga-videos",
    allowed_formats: ["mp4", "mov", "avi", "wmv", "flv", "mkv"],
    resource_type: "video",
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    public_id: (req, file) => `yoga-video-${Date.now()}`,
  },
});

// Cloudinary storage for blog images
const blogImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blogs/featured_images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 800, crop: "fill" },
      { quality: "auto" }
    ],
    public_id: (req, file) => `blog-featured-${Date.now()}`
  },
});

// Image file filter
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// Video file filter
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"), false);
  }
};

// Create multer upload instances
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: videoFileFilter,
});

// Blog upload middleware using Cloudinary
export const blogUpload = multer({
  storage: blogImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
}).fields([
  { name: "image", maxCount: 1 },
  { name: "authorImage", maxCount: 1 },
]);

// Error handler for upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

export default uploadImage;