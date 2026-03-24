const express = require('express');
const router = express.Router();
const playlists = require('../config/playlists');

/**
 * GET /api/playlists
 * 获取所有播放列表
 */
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    
    let result = playlists;
    
    // 按分类筛选
    if (category) {
      result = result.filter(p => p.category === category);
    }
    
    res.json({
      success: true,
      data: result,
      count: result.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[PlaylistsRoute] Error fetching playlists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlists',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/playlists/:id
 * 获取单个播放列表详情
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const playlist = playlists.find(p => p.id === id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: playlist,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[PlaylistsRoute] Error fetching playlist ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlist',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
