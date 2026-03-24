const db = require('../database');

class AudioService {
  // 获取所有音频文件（支持分页和搜索）
  static getAllAudioFiles(page = 1, limit = 20, search = '') {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM audio_files WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) as total FROM audio_files WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)';
        countQuery += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)';
        const searchPattern = `%${search}%`;
        params = [searchPattern, searchPattern, searchPattern];
      }

      query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?';
      
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        db.get(countQuery, params, (err, countRow) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            data: rows,
            pagination: {
              page,
              limit,
              total: countRow.total,
              totalPages: Math.ceil(countRow.total / limit)
            }
          });
        });
      });
    });
  }

  // 根据 ID 获取单个音频文件
  static getAudioById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM audio_files WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  // 创建音频记录
  static createAudioFile(audioData) {
    return new Promise((resolve, reject) => {
      const {
        filename,
        original_name,
        file_path,
        file_size,
        duration,
        bitrate,
        sample_rate,
        format,
        title,
        artist,
        album,
        genre,
        cover_art
      } = audioData;

      db.run(
        `INSERT INTO audio_files 
         (filename, original_name, file_path, file_size, duration, bitrate, 
          sample_rate, format, title, artist, album, genre, cover_art)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [filename, original_name, file_path, file_size, duration, bitrate,
         sample_rate, format, title, artist, album, genre, cover_art],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id: this.lastID, ...audioData });
        }
      );
    });
  }

  // 更新音频元数据
  static updateAudioMetadata(id, metadata) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (metadata.title !== undefined) {
        fields.push('title = ?');
        values.push(metadata.title);
      }
      if (metadata.artist !== undefined) {
        fields.push('artist = ?');
        values.push(metadata.artist);
      }
      if (metadata.album !== undefined) {
        fields.push('album = ?');
        values.push(metadata.album);
      }
      if (metadata.genre !== undefined) {
        fields.push('genre = ?');
        values.push(metadata.genre);
      }
      if (metadata.cover_art !== undefined) {
        fields.push('cover_art = ?');
        values.push(metadata.cover_art);
      }

      if (fields.length === 0) {
        resolve(null);
        return;
      }

      values.push(id);

      db.run(
        `UPDATE audio_files SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ changes: this.changes });
        }
      );
    });
  }

  // 增加播放次数并更新最后播放时间
  static incrementPlayCount(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE audio_files 
         SET play_count = play_count + 1, last_played = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ changes: this.changes });
        }
      );
    });
  }

  // 记录播放历史
  static recordPlayHistory(audioId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO play_history (audio_id) VALUES (?)',
        [audioId],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id: this.lastID });
        }
      );
    });
  }

  // 获取播放历史记录
  static getPlayHistory(audioId = null, limit = 20) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT ph.*, af.filename, af.title, af.artist 
        FROM play_history ph
        JOIN audio_files af ON ph.audio_id = af.id
        WHERE 1=1
      `;
      let params = [];

      if (audioId) {
        query += ' AND ph.audio_id = ?';
        params.push(audioId);
      }

      query += ' ORDER BY ph.played_at DESC LIMIT ?';
      params.push(limit);

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  // 删除音频文件
  static deleteAudioFile(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM audio_files WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ changes: this.changes });
      });
    });
  }

  // 获取统计信息
  static getStats() {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM audio_files', (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        const total = row.total;
        
        // 获取总时长、总大小等
        db.get(`
          SELECT 
            SUM(duration) as total_duration,
            SUM(file_size) as total_size
          FROM audio_files
        `, (err, sizeRow) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            totalFiles: total,
            totalDuration: sizeRow.total_duration || 0,
            totalSize: sizeRow.total_size || 0
          });
        });
      });
    });
  }
}

module.exports = AudioService;
