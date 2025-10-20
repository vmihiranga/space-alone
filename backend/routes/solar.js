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

  // Get solar system configuration (public)
  router.get('/', (req, res) => {
    db.get(
      'SELECT * FROM solar_config WHERE id = 1',
      [],
      (err, row) => {
        if (err) {
          console.error('Error fetching solar config:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!row) {
          return res.json({
            solar_rotation_speed: 0.5,
            solar_planet_count: 8,
            solar_orbit_color: '#00f3ff'
          });
        }

        res.json(row);
      }
    );
  });

  // Update solar system configuration (requires authentication)
  router.put('/', authMiddleware, adminMiddleware, (req, res) => {
    const { rotation_speed, planet_count, orbit_color } = req.body;

    if (rotation_speed !== undefined && (rotation_speed < 0.1 || rotation_speed > 5)) {
      return res.status(400).json({ error: 'Rotation speed must be between 0.1 and 5' });
    }

    if (planet_count !== undefined && ![3, 5, 8].includes(parseInt(planet_count))) {
      return res.status(400).json({ error: 'Planet count must be 3, 5, or 8' });
    }

    if (orbit_color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(orbit_color)) {
      return res.status(400).json({ error: 'Invalid color format' });
    }

    const updates = [];
    const params = [];

    if (rotation_speed !== undefined) {
      updates.push('solar_rotation_speed = ?');
      params.push(parseFloat(rotation_speed));
    }

    if (planet_count !== undefined) {
      updates.push('solar_planet_count = ?');
      params.push(parseInt(planet_count));
    }

    if (orbit_color !== undefined) {
      updates.push('solar_orbit_color = ?');
      params.push(orbit_color);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const query = `UPDATE solar_config SET ${updates.join(', ')} WHERE id = 1`;

    db.run(query, params, function(err) {
      if (err) {
        console.error('Error updating solar config:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log(`✅ Solar config updated by ${req.user.username}`);

      res.json({ 
        message: 'Solar system configuration updated successfully',
        changes: this.changes
      });
    });
  });

  return router;
};
