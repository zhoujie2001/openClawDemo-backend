const express = require('express');
const router = express.Router();
const AudioService = require('../services/audioService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|flac|aac|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname || mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file format. Allowed: mp3, wav, flac, aac, ogg, m4a'));
    }
  }
});

/**
 * GET /api/audio
 * 获取所有音频文件（支持分页和搜索）
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await AudioService.getAllAudioFiles(page, limit, search);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('[AudioRoute] Error getting audio files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audio files',
      message: error.message
    });
  }
});

/**
 * GET /api/audio/stats
 * 获取统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await AudioService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[AudioRoute] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/audio/:id
 * 获取单个音频文件详情
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const audio = await AudioService.getAudioById(id);

    if (!audio) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    res.json({
      success: true,
      data: audio
    });
  } catch (error) {
    console.error('[AudioRoute] Error getting audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audio file',
      message: error.message
    });
  }
});

/**
 * POST /api/audio
 * 上传音频文件
 */
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded'
      });
    }

    const file = req.file;
    
    // 提取音频元数据（使用 ffprobe）
    let metadata = {};
    try {
      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${file.path}"`
      );
      const probeData = JSON.parse(stdout);
      
      // 从格式信息中提取
      const format = probeData.format;
      metadata.duration = parseFloat(format.duration) || null;
      metadata.bitrate = parseInt(format.bit_rate) || null;
      metadata.sampleRate = parseInt(format.sample_rate) || null;
      metadata.format = format.format_name || format.codec_name || 'unknown';
      metadata.fileSize = parseInt(format.size) || file.size;

      // 从流信息中提取
      if (probeData.streams) {
        const audioStream = probeData.streams.find(s => s.codec_type === 'audio');
        if (audioStream) {
          metadata.channels = audioStream.channels || null;
          metadata.bitDepth = audioStream.bits_per_sample || null;
        }
      }
    } catch (err) {
      console.warn('[AudioRoute] Failed to extract metadata, using basic info:', err.message);
      metadata.fileSize = file.size;
      metadata.format = path.extname(file.originalname).substring(1);
    }

    // 创建音频记录
    const audioData = {
      filename: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: metadata.fileSize,
      duration: metadata.duration,
      bitrate: metadata.bitrate,
      sample_rate: metadata.sampleRate,
      format: metadata.format,
      title: req.body.title || null,
      artist: req.body.artist || null,
      album: req.body.album || null,
      genre: req.body.genre || null,
      cover_art: req.body.cover_art || null
    };

    const created = await AudioService.createAudioFile(audioData);

    res.status(201).json({
      success: true,
      message: 'Audio file uploaded successfully',
      data: created
    });
  } catch (error) {
    console.error('[AudioRoute] Error uploading audio:', error);
    
    // 清理上传的文件
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload audio file',
      message: error.message
    });
  }
});

/**
 * PUT /api/audio/:id
 * 更新音频元数据
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const metadata = req.body;

    // 验证必填字段
    if (!metadata.title && !metadata.artist && !metadata.album && !metadata.genre && !metadata.cover_art) {
      return res.status(400).json({
        success: false,
        error: 'At least one metadata field must be provided'
      });
    }

    const result = await AudioService.updateAudioMetadata(id, metadata);

    if (!result || result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found or no changes made'
      });
    }

    res.json({
      success: true,
      message: 'Audio metadata updated successfully',
      data: result
    });
  } catch (error) {
    console.error('[AudioRoute] Error updating audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update audio metadata',
      message: error.message
    });
  }
});

/**
 * DELETE /api/audio/:id
 * 删除音频文件
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // 先获取文件路径
    const audio = await AudioService.getAudioById(id);
    if (!audio) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    // 删除物理文件
    try {
      fs.unlinkSync(audio.file_path);
    } catch (err) {
      console.warn('[AudioRoute] Failed to delete physical file:', err.message);
    }

    // 从数据库删除
    const result = await AudioService.deleteAudioFile(id);

    res.json({
      success: true,
      message: 'Audio file deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('[AudioRoute] Error deleting audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete audio file',
      message: error.message
    });
  }
});

/**
 * GET /api/audio/:id/history
 * 获取播放历史记录
 */
router.get('/:id/history', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 20;

    const history = await AudioService.getPlayHistory(id, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('[AudioRoute] Error getting play history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get play history',
      message: error.message
    });
  }
});

/**
 * POST /api/audio/:id/play
 * 记录播放事件
 */
router.post('/:id/play', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // 检查音频是否存在
    const audio = await AudioService.getAudioById(id);
    if (!audio) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    // 增加播放次数
    await AudioService.incrementPlayCount(id);

    // 记录播放历史
    await AudioService.recordPlayHistory(id);

    res.json({
      success: true,
      message: 'Play count incremented'
    });
  } catch (error) {
    console.error('[AudioRoute] Error recording play:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record play event',
      message: error.message
    });
  }
});

module.exports = router;
