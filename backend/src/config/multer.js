import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", // .jpg, .jpeg
    "image/png", // .png
    "image/gif", // .gif
    "image/webp", // .webp
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error(
        `File type ${file.mimetype} is not allowed. Only images are accepted.`,
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage, // Use memory storage
  fileFilter: fileFilter, // Only allow images
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB per file
  },
});

export default upload;
