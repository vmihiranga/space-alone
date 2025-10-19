const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  // Login endpoint
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Trim whitespace
    const trimmedUsername = username.trim();

    try {
      // Find user in database
      db.get('SELECT * FROM users WHERE username = ?', [trimmedUsername], async (err, user) => {
        if (err) {
          console.error('Database error during login:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log(`✅ User logged in: ${user.username}`);

        // Return token and user info (without password)
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          } 
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Verify token endpoint (optional, for checking if token is valid)
  router.get('/verify', authMiddleware, (req, res) => {
    res.json({ 
      valid: true, 
      user: req.user 
    });
  });

  // Logout endpoint (optional, client-side token removal is sufficient)
  router.post('/logout', authMiddleware, (req, res) => {
    console.log(`🔓 User logged out: ${req.user.username}`);
    res.json({ message: 'Logged out successfully' });
  });

  return router;
};