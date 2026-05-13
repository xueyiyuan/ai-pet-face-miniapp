require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;
const reports = new Map();
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    const mimeLooksLikeImage = file.mimetype && file.mimetype.startsWith('image/');

    if (!mimeLooksLikeImage && !allowedExts.has(ext)) {
      return cb(new Error('only image files are allowed'));
    }
    cb(null, true);
  }
});

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ai-pet-face-server', ts: new Date().toISOString() });
});

app.post('/api/uploads/pet-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'file is required' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({
    imageUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});

app.post('/api/reports', (req, res) => {
  const { imageUrl, petName = '主子', petType = 'unknown' } = req.body || {};
  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  const reportId = uuidv4();
  const report = {
    reportId,
    petName,
    petType,
    imageUrl,
    isPaid: false,
    freeReport: {
      title: `${petName}的宠物面相初判`,
      label: '高冷富贵命',
      summary: '这是一只表面淡定、内心有主见的主子。',
      personality: '观察力强，喜欢掌控节奏，偶尔会用眼神管理全家。',
      ownerView: '它大概率觉得你很吵，但还是会默默接受你的投喂。',
      shareText: `AI 看出来 ${petName} 是「高冷富贵命」，有点拽，但很可爱。`
    },
    paidReport: {
      deepPersonality: '对环境变化敏感，熟人面前会放松，陌生人面前偏谨慎。',
      fortune: '近期有吃好喝好、睡好躺好的福气。',
      relationship: '把你当长期饭票，也当安全基地。',
      healthTips: '建议继续关注饮水、食欲、精神状态与毛发光泽。',
      luckyItem: '软垫小窝',
      luckyFood: '鸡胸肉冻干',
      exclusiveComment: '今天这张脸，属于那种一看就很会过日子的类型。'
    },
    createdAt: new Date().toISOString()
  };

  reports.set(reportId, report);
  res.json({
    reportId,
    isPaid: false,
    freeReport: report.freeReport,
    paidPreview: Object.keys(report.paidReport)
  });
});

app.get('/api/reports/:id', (req, res) => {
  const report = reports.get(req.params.id);
  if (!report) return res.status(404).json({ error: 'report not found' });
  res.json(report);
});

app.post('/api/payments', (req, res) => {
  res.json({
    message: 'payment endpoint reserved',
    payUrl: null,
    success: false
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'image file is too large, max 10MB' });
  }
  res.status(400).json({ error: err.message || 'bad request' });
});

app.listen(port, () => {
  console.log(`AI Pet Face server running at http://localhost:${port}`);
});
