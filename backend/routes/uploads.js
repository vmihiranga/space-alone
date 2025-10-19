const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (db) => {
  const router = express.Router();

  // Middleware to verify session (local to this router)
  const authMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    req.user = req.session.user;
    next();
  };

  const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = process.env.UPLOAD_DIR || './public/uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // Get all uploads (requires authentication)
  router.get('/', authMiddleware, (req, res) => {
    db.all(
      'SELECT * FROM uploads ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          console.error('Error fetching uploads:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
      }
    );
  });

  // Upload image (requires authentication)
  router.post('/', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = `/uploads/${req.file.filename}`;

    db.run(
      'INSERT INTO uploads (filename, original_name, path, mimetype, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.file.filename,
        req.file.originalname,
        url,
        req.file.mimetype,
        req.file.size,
        req.user.id
      ],
      function(err) {
        if (err) {
          console.error('Error saving upload record:', err);
          // Delete the uploaded file if database insert fails
          fs.unlinkSync(req.file.path);
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
          id: this.lastID,
          filename: req.file.filename,
          original_name: req.file.originalname,
          url: url,
          size: req.file.size,
          message: 'File uploaded successfully'
        });
      }
    );
  });

  // Delete upload (requires authentication)
  router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    // First, get the file information
    db.get(
      'SELECT * FROM uploads WHERE id = ?',
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Error fetching upload:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
          return res.status(404).json({ error: 'Upload not found' });
        }

        // Delete from database
        db.run(
          'DELETE FROM uploads WHERE id = ?',
          [req.params.id],
          function(deleteErr) {
            if (deleteErr) {
              console.error('Error deleting upload record:', deleteErr);
              return res.status(500).json({ error: 'Database error' });
            }

            // Delete the physical file
            const uploadDir = process.env.UPLOAD_DIR || './public/uploads';
            const filePath = path.join(uploadDir, row.filename);
            
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            res.json({ message: 'Upload deleted successfully' });
          }
        );
      }
    );
  });

  return router;
};