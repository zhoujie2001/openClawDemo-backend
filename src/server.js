const express = require('express');
const cors = require('cors');
require('dotenv').config();

const playlistRoutes = require('./routes/playlists');
const audioRoutes = require('./routes/audio');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[Request] ${timestamp} - ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api/playlists', playlistRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/health', healthRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'openClawDemo Backend API',
    version: '1.0.0',
    description: '自动化项目管理演示后端服务',
    endpoints: {
      playlists: 'GET /api/playlists - 获取所有播放列表',
      playlistDetail: 'GET /api/playlists/:id - 获取单个播放列表',
      audio: 'GET /api/audio/:name - 获取音频流',
      health: 'GET /api/health - 健康检查'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🦞 ==========================================');
  console.log('🦞  openClawDemo Backend API 已启动');
  console.log('🦞 ==========================================');
  console.log(`🦞  运行环境：${process.env.NODE_ENV || 'development'}`);
  console.log(`🦞  监听端口：${PORT}`);
  console.log(`🦞  API 地址：http://localhost:${PORT}`);
  console.log(`🦞  健康检查：http://localhost:${PORT}/api/health`);
  console.log(`🦞  播放列表：http://localhost:${PORT}/api/playlists`);
  console.log(`🦞  文档说明：http://localhost:${PORT}/`);
  console.log('🦞 ==========================================');
});

module.exports = app;
