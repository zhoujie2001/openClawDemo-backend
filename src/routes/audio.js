const express = require('express');
const router = express.Router();
const path = require('path');

/**
 * GET /api/audio/:name
 * 获取音频流或重定向到音频文件
 * 
 * 注意：当前实现为演示模式，返回模拟响应
 * 实际部署时需要配置真实的音频文件路径或外部 CDN
 */
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;
    const validSounds = ['rain', 'fire', 'forest', 'ocean', 'wind', 'cafe'];
    
    if (!validSounds.includes(name)) {
      return res.status(404).json({
        success: false,
        error: `Audio not found: ${name}. Valid options: ${validSounds.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // 演示模式：返回元数据而非真实音频流
    // 实际部署时可以改为：
    // 1. 返回本地音频文件：return res.sendFile(path.join(__dirname, `../../audio/${name}.mp3`));
    // 2. 重定向到 CDN：return res.redirect(`https://cdn.example.com/audio/${name}.mp3`);
    
    console.log(`[AudioRoute] Demo mode: Audio request for "${name}"`);
    
    res.json({
      success: true,
      demoMode: true,
      message: 'Audio stream is available in production environment',
      audioInfo: {
        name: name,
        format: 'mp3',
        duration: 'infinite_loop',
        sampleRate: '44100 Hz',
        channels: 'stereo'
      },
      note: 'In production, this endpoint will stream the actual audio file',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`[AudioRoute] Error handling audio request for ${req.params.name}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to process audio request',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
