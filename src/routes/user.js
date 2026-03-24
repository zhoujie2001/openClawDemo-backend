const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 认证中间件
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

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash],
        function(err) {
          if (err) reject(err);
          
          const token = jwt.sign(
            { userId: this.lastID, username, email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          resolve({ 
            id: this.lastID, 
            username, 
            email,
            token
          });
        }
      );
    });
  } catch (error) {
    console.error('[AuthRoute] Error during registration:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?',
        [email],
        async (err, user) => {
          if (err) reject(err);
          if (!user) reject(new Error('User not found'));

          const isValid = await bcrypt.compare(password, user.password_hash);
          if (!isValid) reject(new Error('Invalid password'));

          const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          resolve({
            id: user.id,
            username: user.username,
            email: user.email,
            token
          });
        }
      );
    });
  } catch (error) {
    console.error('[AuthRoute] Error during login:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    if (error.message === 'Invalid password') {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
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
router.get('/me', authenticateToken, async (req, res) => {
  try {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
          if (err) reject(err);
          if (!user) reject(new Error('User not found'));
          
          resolve({
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.created_at
          });
        }
      );
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

module.exports = router;
