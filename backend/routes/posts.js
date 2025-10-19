const express = require('express');

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

  // Helper function to create URL-friendly slug
  function createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Get all posts (public) - with pagination support
  router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    // Get total count
    db.get('SELECT COUNT(*) as total FROM posts', [], (err, countRow) => {
      if (err) {
        console.error('Error counting posts:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Get posts with pagination
      db.all(
        'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, rows) => {
          if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            posts: rows || [],
            pagination: {
              page,
              limit,
              total: countRow.total,
              totalPages: Math.ceil(countRow.total / limit)
            }
          });
        }
      );
    });
  });

  // Get single post by ID (public)
  router.get('/:id', (req, res) => {
    const identifier = req.params.id;
    const isNumeric = /^\d+$/.test(identifier);

    const query = isNumeric 
      ? 'SELECT * FROM posts WHERE id = ?'
      : 'SELECT * FROM posts WHERE slug = ?';

    db.get(query, [identifier], (err, row) => {
      if (err) {
        console.error('Error fetching post:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(row);
    });
  });

  // Create new post (requires authentication)
  router.post('/', authMiddleware, adminMiddleware, (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = createSlug(title);

    db.run(
      'INSERT INTO posts (title, slug, content, author_id, author_name) VALUES (?, ?, ?, ?, ?)',
      [title, slug, content, req.user.id, req.user.username],
      function(err) {
        if (err) {
          console.error('Error creating post:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
          id: this.lastID, 
          title, 
          slug,
          content,
          author_name: req.user.username,
          message: 'Post created successfully' 
        });
      }
    );
  });

  // Update post (requires authentication)
  router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = createSlug(title);

    db.run(
      'UPDATE posts SET title = ?, slug = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, slug, content, req.params.id],
      function(err) {
        if (err) {
          console.error('Error updating post:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post updated successfully', slug });
      }
    );
  });

  // Delete post (requires authentication)
  router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    db.run(
      'DELETE FROM posts WHERE id = ?',
      [req.params.id],
      function(err) {
        if (err) {
          console.error('Error deleting post:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
      }
    );
  });

  // Search posts (public)
  router.get('/search', (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search query required' });
    }

    db.all(
      'SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC',
      [`%${searchTerm}%`, `%${searchTerm}%`],
      (err, rows) => {
        if (err) {
          console.error('Error searching posts:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
      }
    );
  });

  return router;
};