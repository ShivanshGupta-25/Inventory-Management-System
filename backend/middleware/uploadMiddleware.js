const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadRoot = path.join(
  __dirname,
  "..",
  "uploads"
);

const imageDirectory = path.join(
  uploadRoot,
  "images"
);

const documentDirectory = path.join(
  uploadRoot,
  "documents"
);

fs.mkdirSync(imageDirectory, {
  recursive: true,
});

fs.mkdirSync(documentDirectory, {
  recursive: true,
});

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return cb(null, true);
  }

  const error = new Error(
    "Unsupported file type"
  );

  error.statusCode = 400;

  cb(error, false);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, imageDirectory);
    }

    return cb(null, documentDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const baseName = path
      .basename(
        file.originalname,
        extension
      )
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}-${baseName}${extension}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      10 * 1024 * 1024,

    files: 5,
  },
});

module.exports = {
  upload,
};