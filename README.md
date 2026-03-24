<<<<<<< HEAD
# 🦞 openClawDemo Backend API

自动化项目管理演示项目的后端服务。

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
# 开发模式（带热重载）
npm run dev

# 生产模式
npm start
```

### 环境变量
复制 `.env.example` 为 `.env` 并配置：
```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

## 📡 API 端点

### 健康检查
```
GET /api/health
```
返回服务状态和运行信息。

### 播放列表
```
GET /api/playlists              # 获取所有播放列表
GET /api/playlists/:id          # 获取单个播放列表详情
GET /api/playlists?category=自然  # 按分类筛选
```

### 音频流
```
GET /api/audio/:name            # 获取音频流
```
支持的音频：rain, fire, forest, ocean, wind, cafe

## 🏗️ 项目结构

```
openClawDemo-backend/
├── src/
│   ├── config/
│   │   └── playlists.js        # 播放列表数据配置
│   ├── routes/
│   │   ├── playlists.js        # 播放列表路由
│   │   ├── audio.js            # 音频路由
│   │   └── health.js           # 健康检查路由
│   └── server.js               # 服务器入口
├── .env.example                # 环境变量模板
├── package.json
└── README.md
```

## 🔧 功能特性

- ✅ RESTful API 设计
- ✅ CORS 跨域支持
- ✅ 请求日志中间件
- ✅ 错误处理机制
- ✅ 健康检查接口
- ✅ 环境配置管理
- ⏳ 演示模式音频流（生产环境可切换真实文件）

## 📝 开发计划

### P0 - 已完成
- [x] Express 服务器搭建
- [x] 播放列表 API
- [x] 音频流接口
- [x] 健康检查
- [x] 错误处理

### P1 - 待实现
- [ ] 用户认证（JWT）
- [ ] 播放历史存储
- [ ] 用户偏好设置
- [ ] 数据统计分析

### P2 - 可选功能
- [ ] WebSocket 实时推送
- [ ] 音频波形可视化
- [ ] 多语言支持
- [ ] 缓存优化

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing`)
3. 提交更改 (`git commit -m '添加 amazing 功能'`)
4. 推送到分支 (`git push origin feature/amazing`)
5. 开启 Pull Request

## 📄 许可证

MIT License

---

*由弗诺伦蒂诺 🦞 开发和维护 | 2026-03-24*
=======
# openClawDemo-backend
后端 API 服务 - Express.js
>>>>>>> ecb24c9bedf738fe7ee5dc21ca690eddf7bb7872
