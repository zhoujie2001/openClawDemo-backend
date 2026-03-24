const db = require('../database');

class MediaService {
  // 自动识别文件类型
  static determineFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/') || mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'document';
    return 'other';
  }

  // 上传媒体文件
  static async uploadMedia(userId, file, metadata = {}) {
    const { filename, originalname, path: filePath, size, mimetype } = file;
    const fileType = this.determineFileType(mimetype);

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO media_files 
         (user_id, file_name, original_name, file_path, file_size, file_type, mime_type, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, filename, originalname, filePath, size, fileType, mimetype, JSON.stringify(metadata)],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, fileType, filename, originalname });
        }
      );
    });
  }

  // 获取单个媒体文件详情
  static async getMediaById(userId, mediaId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM media_files WHERE id = ? AND user_id = ?',
        [mediaId, userId],
        (err, media) => {
          if (err) reject(err);
          if (media) media.metadata = JSON.parse(media.metadata || '{}');
          resolve(media);
        }
      );
    });
  }

  // 获取媒体列表（支持分页和筛选）
  static async getMediaList(userId, filters = {}) {
    const { fileType, isPublic, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM media_files WHERE user_id = ?';
    const params = [userId];

    if (fileType) {
      query += ' AND file_type = ?';
      params.push(fileType);
    }
    if (isPublic !== undefined) {
      query += ' AND is_public = ?';
      params.push(isPublic ? 1 : 0);
    }

    query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, mediaList) => {
        if (err) reject(err);
        mediaList.forEach(media => media.metadata = JSON.parse(media.metadata || '{}'));
        resolve(mediaList);
      });
    });
  }

  // 删除媒体文件
  static async deleteMedia(userId, mediaId) {
    const media = await this.getMediaById(userId, mediaId);
    if (!media) throw new Error('Media not found');

    try {
      const fs = require('fs').promises;
      await fs.unlink(media.file_path);
    } catch (err) {
      console.warn('Failed to delete physical file:', err.message);
    }

    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM media_files WHERE id = ? AND user_id = ?',
        [mediaId, userId],
        function(err) {
          if (err) reject(err);
          resolve({ deleted: this.changes > 0 });
        }
      );
    });
  }

  // 更新媒体元数据
  static async updateMedia(userId, mediaId, updates) {
    const { isPublic, metadata } = updates;
    let query = 'UPDATE media_files SET ';
    const params = [];

    if (isPublic !== undefined) {
      query += 'is_public = ?, ';
      params.push(isPublic ? 1 : 0);
    }
    if (metadata) {
      query += 'metadata = ?, ';
      params.push(JSON.stringify(metadata));
    }

    query = query.slice(0, -2);
    query += ' WHERE id = ? AND user_id = ?';
    params.push(mediaId, userId);

    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        resolve({ updated: this.changes > 0 });
      });
    });
  }

  // 获取统计信息
  static async getStats(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as totalFiles,
          SUM(file_size) as totalSize,
          COUNT(CASE WHEN file_type = 'image' THEN 1 END) as imageCount,
          COUNT(CASE WHEN file_type = 'video' THEN 1 END) as videoCount,
          COUNT(CASE WHEN file_type = 'audio' THEN 1 END) as audioCount,
          COUNT(CASE WHEN file_type = 'document' THEN 1 END) as documentCount
         FROM media_files WHERE user_id = ?`,
        [userId],
        (err, stats) => {
          if (err) reject(err);
          resolve(stats);
        }
      );
    });
  }
}

module.exports = MediaService;
