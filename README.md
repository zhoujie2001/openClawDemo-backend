# openClawDemo Backend API

自动化项目管理演示 - 后端服务

## 🦞 功能特性

- ✅ **音频文件管理** - 上传、删除、元数据编辑
- ✅ **播放记录追踪** - 自动记录播放历史和次数
- ✅ **搜索和分页** - 支持按标题、艺术家、专辑搜索
- ✅ **统计信息** - 文件数量、总时长、总大小
- ✅ **JWT 认证** - 简单的用户登录系统
- ✅ **SQLite 数据库** - 轻量级，无需额外配置
- ✅ **FFmpeg 集成** - 自动提取音频元数据

## 📦 安装

```bash
cd openClawDemo-backend
npm install
```

## 🚀 运行

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm start
```

## 🔌 API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 音频管理
- `GET /api/audio` - 获取所有音频（支持分页和搜索）
  - 查询参数：`page`, `limit`, `search`
- `GET /api/audio/:id` - 获取单个音频详情
- `POST /api/audio` - 上传音频文件
- `PUT /api/audio/:id` - 更新音频元数据
- `DELETE /api/audio/:id` - 删除音频文件
- `GET /api/audio/:id/history` - 获取播放历史
- `POST /api/audio/:id/play` - 记录播放事件
- `GET /api/audio/stats` - 获取统计信息

### 其他
- `GET /api/health` - 健康检查
- `GET /` - API 文档

## 📝 使用示例

### 1. 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 2. 上传音频
```bash
curl -X POST http://localhost:3000/api/audio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@path/to/your/file.mp3" \
  -F "title=My Song" \
  -F "artist=Artist Name"
```

### 3. 获取音频列表
```bash
curl "http://localhost:3000/api/audio?page=1&limit=10&search=rain"
```

### 4. 更新元数据
```bash
curl -X PUT http://localhost:3000/api/audio/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","artist":"New Artist"}'
```

### 5. 记录播放
```bash
curl -X POST http://localhost:3000/api/audio/1/play \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚙️ 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务器端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| FRONTEND_URL | 前端 URL (CORS) | * |
| JWT_SECRET | JWT 密钥 | your-secret-key |
| JWT_EXPIRES_IN | Token 过期时间 | 7d |
| ADMIN_USERNAME | 管理员用户名 | admin |
| ADMIN_PASSWORD | 管理员密码 | admin123 |
| DB_PATH | 数据库文件路径 | ./data.db |

## 🔒 安全提示

⚠️ **生产环境必须修改以下内容：**
- `JWT_SECRET` - 使用强随机字符串
- `ADMIN_PASSWORD` - 使用强密码
- `FRONTEND_URL` - 设置为实际的前端域名

## 🛠️ 技术栈

- **Node.js** + **Express** - Web 框架
- **SQLite** - 数据库
- **Multer** - 文件上传
- **JWT** - 身份验证
- **FFmpeg/FFprobe** - 音频元数据提取

## 📄 许可证

MIT License

---

Made with 🦞 by 弗诺伦蒂诺
