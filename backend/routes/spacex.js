const express = require('express');
const router = express.Router();

// Base URL for SpaceX API
const SPACEX_API_BASE = 'https://api.spacexdata.com/v5';

// Helper function to fetch from SpaceX API
async function fetchSpaceX(endpoint) {
    try {
        const response = await fetch(`${SPACEX_API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`SpaceX API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('SpaceX API Error:', error);
        throw error;
    }
}

// Get latest launch
router.get('/latest', async (req, res) => {
    try {
        const data = await fetchSpaceX('/launches/latest');
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch latest launch',
            message: error.message 
        });
    }
});

// Get upcoming launches
router.get('/upcoming', async (req, res) => {
    try {
        const data = await fetchSpaceX('/launches/upcoming');
        // Return only next 5 launches
        res.json(data.slice(0, 5));
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch upcoming launches',
            message: error.message 
        });
    }
});

// Get past launches with pagination
router.get('/past', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = await fetchSpaceX('/launches/past');
        res.json(data.slice(0, limit));
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch past launches',
            message: error.message 
        });
    }
});

// Get Starlink satellites info
router.get('/starlink', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const response = await fetch(`https://api.spacexdata.com/v4/starlink?limit=${limit}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch Starlink data',
            message: error.message 
        });
    }
});

// Get launch statistics
router.get('/stats', async (req, res) => {
    try {
        const [latest, upcoming, past] = await Promise.all([
            fetchSpaceX('/launches/latest'),
            fetchSpaceX('/launches/upcoming'),
            fetchSpaceX('/launches/past')
        ]);

        const stats = {
            totalLaunches: past.length,
            upcomingLaunches: upcoming.length,
            successfulLaunches: past.filter(l => l.success).length,
            failedLaunches: past.filter(l => l.success === false).length,
            latestLaunch: {
                name: latest.name,
                date: latest.date_utc,
                success: latest.success,
                rocket: latest.rocket
            },
            successRate: ((past.filter(l => l.success).length / past.length) * 100).toFixed(2)
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to calculate stats',
            message: error.message 
        });
    }
});

module.exports = router;
