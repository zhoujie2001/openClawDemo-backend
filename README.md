# 万能个人网站后端服务

支持图片、视频、音频、文档等媒体文件管理

## 🦞 功能特性

- ✅ **用户认证** - 注册、登录、JWT token
- ✅ **通用媒体管理** - 图片、视频、音频、文档等所有类型
- ✅ **文件上传** - 最大 200MB，自动识别文件类型
- ✅ **元数据编辑** - 自定义标签、描述、公开状态
- ✅ **统计信息** - 文件数量、总大小、分类统计
- ✅ **分页查询** - 支持按类型、公开状态筛选
- ✅ **SQLite 数据库** - 轻量级，无需额外配置
- ✅ **权限控制** - 每个用户只能访问自己的文件

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

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息（需要 token）

### 媒体管理
- `GET /api/media` - 获取所有媒体文件（支持分页和筛选）
  - 查询参数：`page`, `limit`, `type`, `isPublic`
- `GET /api/media/:id` - 获取单个媒体文件详情
- `POST /api/media` - 上传媒体文件
- `PUT /api/media/:id` - 更新媒体元数据
- `DELETE /api/media/:id` - 删除媒体文件
- `GET /api/media/:id/download` - 下载媒体文件
- `GET /api/media/stats` - 获取统计信息

### 其他
- `GET /api/health` - 健康检查
- `GET /` - API 文档

## 📝 使用示例

### 1. 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

响应：
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 用户登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. 上传照片
```bash
curl -X POST http://localhost:3000/api/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/your/photo.jpg" \
  -F 'metadata={"tags":["vacation","summer"],"description":"My vacation photo"}'
```

### 4. 上传视频
```bash
curl -X POST http://localhost:3000/api/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/your/video.mp4"
```

### 5. 获取媒体列表
```bash
curl "http://localhost:3000/api/media?page=1&limit=10&type=image" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. 更新元数据
```bash
curl -X PUT http://localhost:3000/api/media/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPublic":true,"metadata":{"tags":["public","featured"]}}'
```

### 7. 下载文件
```bash
curl "http://localhost:3000/api/media/1/download" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded-file.jpg
```

## ⚙️ 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务器端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| FRONTEND_URL | 前端 URL (CORS) | * |
| JWT_SECRET | JWT 密钥 | your-secret-key |
| JWT_EXPIRES_IN | Token 过期时间 | 7d |

## 🔒 安全提示

⚠️ **生产环境必须修改以下内容：**
- `JWT_SECRET` - 使用强随机字符串
- `FRONTEND_URL` - 设置为实际的前端域名

## 🛠️ 技术栈

- **Node.js** + **Express** - Web 框架
- **SQLite** - 数据库
- **bcrypt** - 密码加密
- **JWT** - 身份验证
- **Multer** - 文件上传

## 📄 许可证

MIT License

---

Made with 🦞 by 弗诺伦蒂诺
