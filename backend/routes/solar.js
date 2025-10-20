const express = require('express');

module.exports = (sql) => {
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

  router.get('/', async (req, res) => {
    try {
      const settings = await sql`SELECT * FROM app_settings WHERE id = 1`;
      res.json(settings[0] || {});
    } catch (error) {
      console.error('Error fetching solar settings:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Update solar settings
  router.put('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { rotation_speed, planet_count, orbit_color } = req.body;
    try {
      const result = await sql`
        UPDATE app_settings
        SET 
          solar_rotation_speed = ${rotation_speed ?? 0.5},
          solar_planet_count = ${planet_count ?? 8},
          solar_orbit_color = ${orbit_color ?? '#00f3ff'},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        RETURNING *
      `;

      res.json({
        message: 'Solar settings updated successfully',
        settings: result[0]
      });
    } catch (error) {
      console.error('Error updating solar settings:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
};
