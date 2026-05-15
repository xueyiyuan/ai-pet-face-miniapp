require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = Number(process.env.PORT || 3000);
const baseUrl = process.env.PUBLIC_BASE_URL || '';
const uploadsDir = path.join(__dirname, '..', 'uploads');
const dataDir = path.join(__dirname, '..', 'data');
const reportsFile = path.join(dataDir, 'reports.json');

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

function readReports() {
  if (!fs.existsSync(reportsFile)) return [];

  try {
    const raw = fs.readFileSync(reportsFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read reports file:', err);
    return [];
  }
}

function writeReports(reports) {
  fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), 'utf8');
}

function getRequestBaseUrl(req) {
  if (baseUrl) return baseUrl.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

function pick(seed, items) {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return items[hash % items.length];
}

function generateReport({ petName, petType, imageUrl }) {
  const name = (petName || '').trim() || '小主子';
  const type = petType || 'unknown';
  const typeName = {
    cat: '猫猫',
    dog: '狗狗',
    other: '毛孩子',
    unknown: '毛孩子'
  }[type] || '毛孩子';
  const seed = `${name}:${type}:${imageUrl}`;

  const label = pick(seed, [
    '高冷富贵命',
    '饭碗守护者',
    '人间撒娇王',
    '家宅巡逻官',
    '好运小雷达',
    '被窝风水大师'
  ]);
  const personality = pick(`${seed}:personality`, [
    '外表淡定，内心戏很足，擅长用一个眼神管理全家节奏。',
    '亲近人但有边界感，熟悉之后会把撒娇和指挥结合得非常自然。',
    '行动力强，好奇心旺，看到新鲜东西会先观察三秒再决定要不要接管现场。',
    '情绪稳定，安全感来自固定的作息、熟悉的气味和主人及时出现。'
  ]);
  const ownerView = pick(`${seed}:owner`, [
    '它觉得你是长期饭票、移动靠垫，也是它愿意信任的安全基地。',
    '它大概率认为你有点好拿捏，但总体服务态度不错，值得继续培养。',
    '它把你当成同住伙伴，偶尔嫌你吵，但你不在时又会悄悄找你。',
    '它眼里的你很可靠，只要你按时喂饭、陪玩、夸它，就能保持高分。'
  ]);
  const fortune = pick(`${seed}:fortune`, [
    '最近适合添置新玩具，容易收获更多关注和摸摸。',
    '本周有吃好、睡好、被夸好的运势，适合保持规律作息。',
    '近期家中人气上升，它会更愿意参与家庭活动。',
    '今日宜晒太阳、喝水、舒展身体，整体气场偏松弛。'
  ]);
  const healthTips = pick(`${seed}:health`, [
    '建议继续观察饮水、食欲、精神状态和排便情况，发现异常请及时咨询兽医。',
    '可以多留意毛发光泽、体重变化和活动量，日常护理比临时补救更重要。',
    '保持干净饮水和稳定饮食，不要频繁更换主粮或零食。',
    '适量互动和环境丰富化有助于释放精力，也能减少无聊带来的小脾气。'
  ]);

  return {
    reportId: uuidv4(),
    petName: name,
    petType: type,
    petTypeName: typeName,
    imageUrl,
    isPaid: false,
    freeReport: {
      title: `${name} 的宠物面相报告`,
      label,
      summary: `这是一只自带存在感的${typeName}，气质关键词是“${label}”。`,
      personality,
      ownerView,
      shareText: `AI 看出 ${name} 是「${label}」，快来看看你家毛孩子是什么隐藏命格。`
    },
    paidReport: {
      deepPersonality: pick(`${seed}:deep`, [
        `${name} 对环境变化很敏感，喜欢先确认安全，再慢慢释放真实状态。`,
        `${name} 很会读空气，能分辨主人是真忙还是假装忙，互动策略相当灵活。`,
        `${name} 的核心需求是稳定陪伴，它会通过靠近、跟随或轻声表达存在感。`
      ]),
      fortune,
      relationship: pick(`${seed}:relationship`, [
        '你们的关系像室友加家人：它保留主权，你负责提供爱、饭和舒适空间。',
        '它对你的信任是逐步建立的，稳定回应会让它更愿意表达亲近。',
        '你在它心里属于重要人物，但它会偶尔用小脾气测试你的耐心。'
      ]),
      healthTips,
      luckyItem: pick(`${seed}:item`, ['软垫小窝', '逗猫棒', '慢食碗', '磨牙玩具', '晒太阳角落']),
      luckyFood: pick(`${seed}:food`, ['鸡胸肉冻干', '南瓜小零食', '清水煮鱼肉', '低脂宠物罐头']),
      exclusiveComment: `今天这张脸，属于一看就很会过日子的${typeName}。请继续认真供养，福气会回到主人身上。`
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
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
      return cb(new Error('仅支持 jpg、jpeg、png、gif、webp 图片文件'));
    }
    cb(null, true);
  }
});

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ai-pet-face-server',
    storage: {
      uploadsDir,
      reportsFile
    },
    ts: new Date().toISOString()
  });
});

app.post('/api/uploads/pet-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传宠物图片' });
  }

  const imageUrl = `${getRequestBaseUrl(req)}/uploads/${req.file.filename}`;
  res.json({
    imageUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});

app.post('/api/reports', (req, res) => {
  const { imageUrl, petName, petType = 'unknown' } = req.body || {};

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  const report = generateReport({ imageUrl, petName, petType });
  const reports = readReports();
  reports.unshift(report);
  writeReports(reports);

  res.json({
    reportId: report.reportId,
    isPaid: report.isPaid,
    freeReport: report.freeReport,
    paidPreview: Object.keys(report.paidReport)
  });
});

app.get('/api/reports/:id', (req, res) => {
  const report = readReports().find((item) => item.reportId === req.params.id);
  if (!report) return res.status(404).json({ error: 'report not found' });
  res.json(report);
});

app.post('/api/reports/:id/unlock', (req, res) => {
  const reports = readReports();
  const report = reports.find((item) => item.reportId === req.params.id);

  if (!report) return res.status(404).json({ error: 'report not found' });

  report.isPaid = true;
  report.updatedAt = new Date().toISOString();
  writeReports(reports);

  res.json({
    ok: true,
    report
  });
});

app.post('/api/payments', (req, res) => {
  res.json({
    ok: true,
    mode: 'mock',
    message: '本地 MVP 使用模拟支付。生产环境请接入微信支付后再开放付费。'
  });
});

app.post('/api/payments/wechat/callback', (req, res) => {
  res.json({ ok: true, message: 'wechat payment callback reserved' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '图片不能超过 10MB' });
  }
  res.status(400).json({ error: err.message || 'bad request' });
});

app.listen(port, () => {
  console.log(`AI Pet Face server running at http://localhost:${port}`);
});
