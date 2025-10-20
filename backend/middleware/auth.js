const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  const router = express.Router();


  const authMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });}
    req.user = req.session.user;
    next();
  };


  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });}
    const trimmedUsername = username.trim();
    try {
      db.get('SELECT * FROM users WHERE username = ?', [trimmedUsername], async (err, user) => {
        if (err) {
          console.error('Database error during login:', err);
          return res.status(500).json({ error: 'Database error' });}
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });}
        let validPassword = false;
        
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
   
          validPassword = await bcrypt.compare(password, user.password);} else {
  
          validPassword = password === user.password;
        }
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });}

    
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role
        };

        console.log(`✅ User logged in: ${user.username}`);

        res.json({ 
          message: 'Login successful',
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


  router.get('/verify', authMiddleware, (req, res) => {
    res.json({ 
      valid: true, 
      user: req.session.user 
    });
  });

  router.post('/logout', authMiddleware, (req, res) => {
    const username = req.session?.user?.username || 'Unknown';
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      res.clearCookie('connect.sid');
      console.log(`🔓 User logged out: ${username}`);
      res.json({ message: 'Logged out successfully' });
    });
  });


  router.post('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    try {
      db.get('SELECT * FROM users WHERE id = ?', [req.session.user.id], async (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
 
        let validPassword = false;
        
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          validPassword = await bcrypt.compare(currentPassword, user.password);
        } else {
          validPassword = currentPassword === user.password;
        }
        
        if (!validPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
        

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        db.run('UPDATE users SET password = ? WHERE id = ?', 
          [hashedPassword, req.session.user.id], 
          (err) => {
            if (err) {
              console.error('Password update error:', err);
              return res.status(500).json({ error: 'Failed to update password' });
            }
            
            console.log(`✅ Password changed for user: ${user.username}`);
            res.json({ message: 'Password updated successfully' });
          }
        );
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
