const express = require('express');
const router = express.Router();
const axios = require('axios');

const SPACEFLIGHT_API = 'https://api.spaceflightnewsapi.net/v4';


async function fetchFromAPI(endpoint, params = {}) {
  try {
    const response = await axios.get(`${SPACEFLIGHT_API}${endpoint}`, {
      params,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error.message);
    throw error;
  }
}

router.get('/blogs', async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      search,
      news_site,
      has_launch,
      has_event,
    } = req.query;

    const params = {
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
    };

    if (search) params.search = search;
    if (news_site) params.news_site = news_site;
    if (has_launch) params.has_launch = has_launch;
    if (has_event) params.has_event = has_event;

    const data = await fetchFromAPI('/blogs/', params);

    res.json({
      success: true,
      data: {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blogs',
      message: error.message,
    });
  }
});


router.get('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromAPI(`/blogs/${id}/`);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog',
      message: error.message,
    });
  }
});


router.get('/reports', async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      search,
      news_site,
    } = req.query;

    const params = {
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
    };

    if (search) params.search = search;
    if (news_site) params.news_site = news_site;

    const data = await fetchFromAPI('/reports/', params);

    res.json({
      success: true,
      data: {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message,
    });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromAPI(`/reports/${id}/`);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report',
      message: error.message,
    });
  }
});


router.get('/articles', async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      search,
      news_site,
      has_launch,
      has_event,
    } = req.query;

    const params = {
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
    };

    if (search) params.search = search;
    if (news_site) params.news_site = news_site;
    if (has_launch) params.has_launch = has_launch;
    if (has_event) params.has_event = has_event;

    const data = await fetchFromAPI('/articles/', params);

    res.json({
      success: true,
      data: {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      message: error.message,
    });
  }
});

router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromAPI(`/articles/${id}/`);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
      message: error.message,
    });
  }
});


router.get('/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);


    const [articles, blogs, reports] = await Promise.all([
      fetchFromAPI('/articles/', { limit: limit }),
      fetchFromAPI('/blogs/', { limit: limit }),
      fetchFromAPI('/reports/', { limit: limit }),
    ]);


    const combined = [
      ...articles.results.map(item => ({ ...item, type: 'article' })),
      ...blogs.results.map(item => ({ ...item, type: 'blog' })),
      ...reports.results.map(item => ({ ...item, type: 'report' })),
    ].sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
     .slice(0, limit);

    res.json({
      success: true,
      data: {
        count: combined.length,
        results: combined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest news',
      message: error.message,
    });
  }
});


router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const searchLimit = Math.min(parseInt(limit), 30);


    const [articles, blogs, reports] = await Promise.all([
      fetchFromAPI('/articles/', { search: query, limit: searchLimit }),
      fetchFromAPI('/blogs/', { search: query, limit: searchLimit }),
      fetchFromAPI('/reports/', { search: query, limit: searchLimit }),
    ]);

    // Combine results
    const combined = [
      ...articles.results.map(item => ({ ...item, type: 'article' })),
      ...blogs.results.map(item => ({ ...item, type: 'blog' })),
      ...reports.results.map(item => ({ ...item, type: 'report' })),
    ].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    res.json({
      success: true,
      data: {
        count: combined.length,
        total: articles.count + blogs.count + reports.count,
        results: combined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message,
    });
  }
});

module.exports = router;
