const express = require('express');
const cors = require('cors');
require('dotenv').config();

const playlistRoutes = require('./routes/playlists');
const mediaRoutes = require('./routes/media');
const authRoutes = require('./routes/user');
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
app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'openClawDemo Backend API',
    version: '1.0.0',
    description: '万能个人网站后端服务 - 支持图片、视频、音频、文档等媒体文件管理',
    endpoints: {
      // 认证
      authRegister: 'POST /api/auth/register - 用户注册',
      authLogin: 'POST /api/auth/login - 用户登录',
      authMe: 'GET /api/auth/me - 获取当前用户信息（需要 token）',
      
      // 媒体管理
      mediaList: 'GET /api/media - 获取所有媒体文件（支持分页和筛选）',
      mediaDetail: 'GET /api/media/:id - 获取单个媒体文件详情',
      mediaUpload: 'POST /api/media - 上传媒体文件',
      mediaUpdate: 'PUT /api/media/:id - 更新媒体元数据',
      mediaDelete: 'DELETE /api/media/:id - 删除媒体文件',
      mediaDownload: 'GET /api/media/:id/download - 下载媒体文件',
      mediaStats: 'GET /api/media/stats - 获取媒体统计信息',
      
      // 其他
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
  console.log('🦞  万能个人网站后端服务 - 支持图片、视频、音频、文档等');
  console.log(`🦞  运行环境：${process.env.NODE_ENV || 'development'}`);
  console.log(`🦞  监听端口：${PORT}`);
  console.log(`🦞  API 地址：http://localhost:${PORT}`);
  console.log(`🦞  健康检查：http://localhost:${PORT}/api/health`);
  console.log(`🦞  媒体管理：http://localhost:${PORT}/api/media`);
  console.log(`🦞  用户认证：http://localhost:${PORT}/api/auth`);
  console.log(`🦞  文档说明：http://localhost:${PORT}/`);
  console.log('🦞 ==========================================');
});

module.exports = app;
