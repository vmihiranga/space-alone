const express = require('express');
const router = express.Router();

// NASA API Base URL
const NASA_API_KEY = process.env.NASA_API_KEY || 'fcwxpTL3pvhkwWWF8naDPrIFd4vkw6nqi1IvQRdi';
const NASA_BASE = 'https://api.nasa.gov';

// Helper function to fetch from NASA with performance tracking
async function fetchNASA(endpoint, resourceName) {
  const startTime = Date.now();
  
  try {
    const url = `${NASA_BASE}${endpoint}`;
    console.log(`[${resourceName}] Fetching:`, url);
    
    const response = await fetch(url);
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${resourceName}] Error: ${response.status} - ${errorText}`);
      throw new Error(`NASA API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[${resourceName}] Success in ${duration}ms`);
    
    return {
      data,
      metadata: {
        resource: 'NASA',
        endpoint: resourceName,
        speed: `${duration}ms`,
        timestamp: new Date().toISOString(),
        status: 'success'
      }
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${resourceName}] Failed in ${duration}ms:`, error.message);
    throw error;
  }
}

// Helper for non-NASA APIs
async function fetchExternal(url, resourceName) {
  const startTime = Date.now();
  
  try {
    console.log(`[${resourceName}] Fetching:`, url);
    const response = await fetch(url);
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[${resourceName}] Success in ${duration}ms`);
    
    return {
      data,
      metadata: {
        resource: resourceName,
        speed: `${duration}ms`,
        timestamp: new Date().toISOString(),
        status: 'success'
      }
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${resourceName}] Failed in ${duration}ms:`, error.message);
    throw error;
  }
}

// 1. Astronomy Picture of the Day
router.get('/apod', async (req, res) => {
  try {
    let date = req.query.date;
    
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    
    // Ensure date isn't in the future
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      return res.status(400).json({ 
        error: 'Date cannot be in the future',
        resource: 'NASA',
        endpoint: 'APOD'
      });
    }
    
    const result = await fetchNASA(`/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`, 'APOD');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch APOD', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'APOD'
    });
  }
});

// 2. Mars Rover Photos (Curiosity)
router.get('/mars-photos', async (req, res) => {
  try {
    const sol = req.query.sol || 1000;
    const result = await fetchNASA(`/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${NASA_API_KEY}`, 'Mars Rover Photos');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch Mars photos', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'Mars Rover Photos'
    });
  }
});

// 3. Near Earth Objects (NEO)
router.get('/neo', async (req, res) => {
  try {
    const startDate = req.query.start_date || new Date().toISOString().split('T')[0];
    const endDate = req.query.end_date || startDate;
    const result = await fetchNASA(`/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`, 'Near Earth Objects');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch NEO data', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'Near Earth Objects'
    });
  }
});

// 4. Earth Imagery
router.get('/earth-imagery', async (req, res) => {
  try {
    const lat = req.query.lat || 29.78;
    const lon = req.query.lon || -95.33;
    const date = req.query.date || '2018-01-01';
    const result = await fetchNASA(`/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${date}&api_key=${NASA_API_KEY}`, 'Earth Imagery');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch Earth imagery', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'Earth Imagery'
    });
  }
});

// 5. EPIC (Earth Polychromatic Imaging Camera)
router.get('/epic', async (req, res) => {
  try {
    const result = await fetchNASA(`/EPIC/api/natural?api_key=${NASA_API_KEY}`, 'EPIC');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch EPIC data', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'EPIC'
    });
  }
});

// 6. Asteroids - NeoWs
router.get('/asteroids', async (req, res) => {
  try {
    const result = await fetchNASA(`/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`, 'Asteroids');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch asteroid data', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'Asteroids'
    });
  }
});

// 7. Exoplanet Archive
router.get('/exoplanets', async (req, res) => {
  try {
    const result = await fetchExternal(
      'https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&format=json&select=pl_name,pl_orbper,pl_rade,st_dist',
      'NASA Exoplanet Archive'
    );
    result.data = result.data.slice(0, 100); // Limit to 100
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch exoplanet data', 
      message: error.message,
      resource: 'NASA Exoplanet Archive',
      endpoint: 'Exoplanets'
    });
  }
});

// 8. Mars Weather (InSight)
router.get('/mars-weather', async (req, res) => {
  try {
    const result = await fetchNASA(`/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`, 'Mars Weather');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch Mars weather', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'Mars Weather'
    });
  }
});

// 9. Solar Flare Data (DONKI)
router.get('/solar-flares', async (req, res) => {
  try {
    const startDate = req.query.start_date || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
    const endDate = req.query.end_date || new Date().toISOString().split('T')[0];
    const result = await fetchNASA(`/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`, 'Solar Flares');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch solar flare data', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'Solar Flares'
    });
  }
});

// 10. ISS Current Location
router.get('/iss-location', async (req, res) => {
  try {
    const result = await fetchExternal('http://api.open-notify.org/iss-now.json', 'Open Notify');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch ISS location', 
      message: error.message,
      resource: 'Open Notify',
      endpoint: 'ISS Location'
    });
  }
});

// 11. Space Weather
router.get('/space-weather', async (req, res) => {
  try {
    const result = await fetchNASA(`/DONKI/notifications?api_key=${NASA_API_KEY}`, 'Space Weather');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch space weather', 
      message: error.message,
      resource: 'NASA',
      endpoint: 'Space Weather'
    });
  }
});

// 12. API Status/Health Check
router.get('/status', async (req, res) => {
  const endpoints = [
    { name: 'APOD', path: '/apod' },
    { name: 'Mars Photos', path: '/mars-photos' },
    { name: 'NEO', path: '/neo' },
    { name: 'Asteroids', path: '/asteroids' },
    { name: 'ISS Location', path: '/iss-location' }
  ];
  
  res.json({
    service: 'NASA API Gateway',
    status: 'operational',
    resource: 'NASA',
    apiKey: NASA_API_KEY === 'DEMO_KEY' ? 'DEMO_KEY (Limited)' : 'Custom Key',
    endpoints: endpoints,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;