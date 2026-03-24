const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH);

// 初始化数据库表结构
db.serialize(() => {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 通用媒体文件表
  db.run(`
    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      metadata TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_accessed DATETIME,
      is_public BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 创建索引以提高查询性能
  db.run('CREATE INDEX IF NOT EXISTS idx_media_user ON media_files(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_media_type ON media_files(file_type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_media_public ON media_files(is_public)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_username ON users(username)');

  // 初始化管理员用户（仅开发环境）
  if (process.env.NODE_ENV === 'development') {
    db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (!row) {
        db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          ['admin', 'admin@example.com', '$2b$10$EixZaYb4xU58Gpq1R0yWbeb00LU5qUaK6x6h2u7v0h1Gz7v0h1Gz7'],
          (err) => {
            if (err) console.error('Failed to create admin user:', err);
            else console.log('✅ Admin user created (development only)');
          }
        );
      }
    });
  }

  console.log('✅ 数据库表结构初始化完成');
});

// 导出数据库实例
module.exports = db;
