const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH);

// 初始化数据库表结构
db.serialize(() => {
  // 音频文件表
  db.run(`
    CREATE TABLE IF NOT EXISTS audio_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      duration REAL,
      bitrate INTEGER,
      sample_rate INTEGER,
      format TEXT,
      title TEXT,
      artist TEXT,
      album TEXT,
      genre TEXT,
      cover_art TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_played DATETIME,
      play_count INTEGER DEFAULT 0
    )
  `);

  // 播放历史记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS play_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audio_id INTEGER NOT NULL,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (audio_id) REFERENCES audio_files(id)
    )
  `);

  // 用户配置表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建索引以提高查询性能
  db.run('CREATE INDEX IF NOT EXISTS idx_audio_filename ON audio_files(filename)');
  db.run('CREATE INDEX IF NOT EXISTS idx_audio_artist ON audio_files(artist)');
  db.run('CREATE INDEX IF NOT EXISTS idx_audio_title ON audio_files(title)');
  db.run('CREATE INDEX IF NOT EXISTS idx_play_history_audio ON play_history(audio_id)');

  console.log('✅ 数据库表结构初始化完成');
});

// 导出数据库实例
module.exports = db;
