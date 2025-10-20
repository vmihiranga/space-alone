const express = require('express');

module.exports = (db) => {
  const router = express.Router();

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

  function createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    db.get('SELECT COUNT(*) as total FROM posts', [], (err, countRow) => {
      if (err) {
        console.error('Error counting posts:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.all(
        `SELECT p.*, 
         (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
         (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
         FROM posts p 
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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

  router.get('/search/query', (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search query required' });
    }

    db.all(
      `SELECT p.*, 
       (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
       (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
       FROM posts p 
       WHERE title LIKE ? OR content LIKE ? 
       ORDER BY created_at DESC`,
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

  router.get('/:id', (req, res) => {
    const identifier = req.params.id;
    const isNumeric = /^\d+$/.test(identifier);

    const query = isNumeric 
      ? `SELECT p.*, 
         (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
         (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
         FROM posts p WHERE p.id = ?`
      : `SELECT p.*, 
         (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
         (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id) as shares
         FROM posts p WHERE p.slug = ?`;

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
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'A post with this title already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.run(
          'INSERT INTO user_activity (user_id, username, action, details) VALUES (?, ?, ?, ?)',
          [req.user.id, req.user.username, 'CREATE_POST', `Created post: ${title}`],
          () => {}
        );

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
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'A post with this title already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }

        db.run(
          'INSERT INTO user_activity (user_id, username, action, details) VALUES (?, ?, ?, ?)',
          [req.user.id, req.user.username, 'UPDATE_POST', `Updated post: ${title}`],
          () => {}
        );

        res.json({ message: 'Post updated successfully', slug });
      }
    );
  });

  router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    db.get('SELECT title FROM posts WHERE id = ?', [req.params.id], (err, post) => {
      if (err || !post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      db.run(
        'DELETE FROM posts WHERE id = ?',
        [req.params.id],
        function(err) {
          if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          db.run(
            'INSERT INTO user_activity (user_id, username, action, details) VALUES (?, ?, ?, ?)',
            [req.user.id, req.user.username, 'DELETE_POST', `Deleted post: ${post.title}`],
            () => {}
          );

          res.json({ message: 'Post deleted successfully' });
        }
      );
    });
  });


  router.get('/:id/likes', (req, res) => {
    db.get(
      'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Error counting likes:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ count: row.count });
      }
    );
  });

  router.post('/:id/like', (req, res) => {
    const postId = req.params.id;
    const userIdentifier = req.session?.user?.id || req.ip || 'anonymous';

    db.run(
      'INSERT OR IGNORE INTO post_likes (post_id, user_identifier) VALUES (?, ?)',
      [postId, userIdentifier],
      function(err) {
        if (err) {
          console.error('Error adding like:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.get(
          'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
          [postId],
          (err, row) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ 
              message: 'Post liked', 
              likes: row.count,
              liked: true
            });
          }
        );
      }
    );
  });

  router.delete('/:id/like', (req, res) => {
    const postId = req.params.id;
    const userIdentifier = req.session?.user?.id || req.ip || 'anonymous';

    db.run(
      'DELETE FROM post_likes WHERE post_id = ? AND user_identifier = ?',
      [postId, userIdentifier],
      function(err) {
        if (err) {
          console.error('Error removing like:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.get(
          'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
          [postId],
          (err, row) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ 
              message: 'Like removed', 
              likes: row.count,
              liked: false
            });
          }
        );
      }
    );
  });

  router.get('/:id/liked', (req, res) => {
    const postId = req.params.id;
    const userIdentifier = req.session?.user?.id || req.ip || 'anonymous';

    db.get(
      'SELECT * FROM post_likes WHERE post_id = ? AND user_identifier = ?',
      [postId, userIdentifier],
      (err, row) => {
        if (err) {
          console.error('Error checking like status:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ liked: !!row });
      }
    );
  });

  router.post('/:id/share', (req, res) => {
    const postId = req.params.id;
    const { platform } = req.body;
    const userIdentifier = req.session?.user?.id || req.ip || 'anonymous';

    if (!platform) {
      return res.status(400).json({ error: 'Platform required' });
    }

    db.run(
      'INSERT INTO post_shares (post_id, platform, user_identifier) VALUES (?, ?, ?)',
      [postId, platform, userIdentifier],
      function(err) {
        if (err) {
          console.error('Error tracking share:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Share tracked successfully' });
      }
    );
  });

  router.get('/:id/shares', (req, res) => {
    db.get(
      'SELECT COUNT(*) as count FROM post_shares WHERE post_id = ?',
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Error counting shares:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ count: row.count });
      }
    );
  });

  return router;
};
