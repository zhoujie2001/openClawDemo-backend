const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * 健康检查接口
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
