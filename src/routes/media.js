const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MediaService = require('../services/MediaService');

// 配置 Multer 用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  fileFilter: (req, file, cb) => {
    // 允许所有媒体类型
    cb(null, true);
  }
});

/**
 * GET /api/media/stats
 * 获取用户媒体统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await MediaService.getStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[MediaRoute] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/media
 * 获取所有媒体文件（支持分页和筛选）
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const fileType = req.query.type;
    const isPublic = req.query.isPublic === 'true';

    const filters = { fileType, isPublic, page, limit };
    const result = await MediaService.getMediaList(userId, filters);

    res.json({
      success: true,
      data: result,
      pagination: {
        page,
        limit,
        total: result.length
      }
    });
  } catch (error) {
    console.error('[MediaRoute] Error getting media list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get media files',
      message: error.message
    });
  }
});

/**
 * GET /api/media/:id
 * 获取单个媒体文件详情
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);
    const media = await MediaService.getMediaById(userId, id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media file not found'
      });
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('[MediaRoute] Error getting media:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get media file',
      message: error.message
    });
  }
});

/**
 * POST /api/media
 * 上传媒体文件
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const userId = req.user.userId;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    const created = await MediaService.uploadMedia(userId, req.file, metadata);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: created
    });
  } catch (error) {
    console.error('[MediaRoute] Error uploading file:', error);
    
    // 清理上传的文件
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message
    });
  }
});

/**
 * PUT /api/media/:id
 * 更新媒体文件元数据
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);
    const updates = {
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : undefined,
      metadata: req.body.metadata
    };

    const result = await MediaService.updateMedia(userId, id, updates);

    if (!result.updated) {
      return res.status(404).json({
        success: false,
        error: 'Media file not found or no changes made'
      });
    }

    res.json({
      success: true,
      message: 'Media metadata updated successfully',
      data: result
    });
  } catch (error) {
    console.error('[MediaRoute] Error updating media:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update media metadata',
      message: error.message
    });
  }
});

/**
 * DELETE /api/media/:id
 * 删除媒体文件
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);

    const result = await MediaService.deleteMedia(userId, id);

    res.json({
      success: true,
      message: 'Media file deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('[MediaRoute] Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete media file',
      message: error.message
    });
  }
});

/**
 * GET /api/media/:id/download
 * 下载媒体文件
 */
router.get('/:id/download', async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id);
    const media = await MediaService.getMediaById(userId, id);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media file not found'
      });
    }

    res.download(media.file_path, media.original_name);
  } catch (error) {
    console.error('[MediaRoute] Error downloading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file',
      message: error.message
    });
  }
});

module.exports = router;
