const multer = require('multer');

const storage = multer.memoryStorage();

// Multer with the in-memory storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limit - 5MB
});

module.exports = upload;
