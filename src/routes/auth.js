const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/login
 * 用户登录（简单用户名密码验证）
 */
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // 简单验证（生产环境应该使用数据库存储的用户信息）
    if (username === process.env.ADMIN_USERNAME || username === 'admin') {
      if (password === process.env.ADMIN_PASSWORD || password === 'admin123') {
        const token = jwt.sign(
          { 
            userId: 1, 
            username: username,
            role: 'admin'
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: {
              id: 1,
              username: username,
              role: 'admin'
            }
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid username or password'
    });
  } catch (error) {
    console.error('[AuthRoute] Error during login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('[AuthRoute] Error getting user info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
      message: error.message
    });
  }
});

// 中间件：验证 JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
