require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const imageModelConfig = require('./config/imageModel');

const app = express();
const port = Number(process.env.PORT || 3000);
const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
const uploadsDir = path.join(__dirname, '..', 'uploads');
const generatedDir = path.join(__dirname, '..', 'generated');
const dataDir = path.join(__dirname, '..', 'data');
const reportsFile = path.join(dataDir, 'reports.json');
const generationsFile = path.join(dataDir, 'image-generations.json');

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || JSON.stringify(fallback));
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
    return fallback;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getRequestBaseUrl(req) {
  if (publicBaseUrl) return publicBaseUrl.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

function publicUrl(req, folder, filename) {
  return `${getRequestBaseUrl(req)}/${folder}/${filename}`;
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

function getRelayEndpoint() {
  const base = imageModelConfig.baseUrl.replace(/\/$/, '');
  const pathPart = imageModelConfig.editPath.startsWith('/')
    ? imageModelConfig.editPath
    : `/${imageModelConfig.editPath}`;
  return `${base}${pathPart}`;
}

function getGeneratedFileExtension(contentType, preferredFormat) {
  if (contentType && contentType.includes('jpeg')) return '.jpg';
  if (contentType && contentType.includes('webp')) return '.webp';
  if (contentType && contentType.includes('png')) return '.png';
  return `.${preferredFormat || 'png'}`;
}

function findImagePayload(value) {
  if (!value || typeof value !== 'object') return null;

  if (typeof value.b64_json === 'string') {
    return { type: 'base64', value: value.b64_json };
  }
  if (typeof value.image_base64 === 'string') {
    return { type: 'base64', value: value.image_base64 };
  }
  if (typeof value.url === 'string') {
    return { type: 'url', value: value.url };
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImagePayload(item);
      if (found) return found;
    }
    return null;
  }

  for (const item of Object.values(value)) {
    const found = findImagePayload(item);
    if (found) return found;
  }
  return null;
}

async function saveGeneratedImage(req, payload) {
  const filenameBase = `${Date.now()}-${uuidv4()}`;

  if (payload.type === 'base64') {
    const filename = `${filenameBase}.${imageModelConfig.outputFormat || 'png'}`;
    const filePath = path.join(generatedDir, filename);
    fs.writeFileSync(filePath, Buffer.from(payload.value, 'base64'));
    return publicUrl(req, 'generated', filename);
  }

  if (payload.type === 'url') {
    const response = await fetch(payload.value);
    if (!response.ok) {
      throw new Error(`Failed to download generated image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const ext = getGeneratedFileExtension(contentType, imageModelConfig.outputFormat);
    const filename = `${filenameBase}${ext}`;
    const filePath = path.join(generatedDir, filename);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    return publicUrl(req, 'generated', filename);
  }

  throw new Error('Unsupported generated image payload');
}

async function callImageRelay(req, file, prompt) {
  if (typeof fetch !== 'function' || typeof FormData !== 'function' || typeof Blob !== 'function') {
    throw new Error('Image generation requires Node.js 18 or newer');
  }
  if (!imageModelConfig.apiKey) {
    throw new Error('IMAGE_RELAY_API_KEY is not configured');
  }

  const imageBuffer = fs.readFileSync(file.path);
  const form = new FormData();
  form.append('model', imageModelConfig.model);
  form.append('prompt', prompt);
  form.append('image', new Blob([imageBuffer], { type: file.mimetype || 'image/png' }), file.originalname || 'input.png');
  form.append('n', String(imageModelConfig.n));
  form.append('size', imageModelConfig.size);
  form.append('output_format', imageModelConfig.outputFormat);

  if (imageModelConfig.quality) form.append('quality', imageModelConfig.quality);
  if (imageModelConfig.background) form.append('background', imageModelConfig.background);

  const response = await fetch(getRelayEndpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${imageModelConfig.apiKey}`
    },
    body: form
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Image relay returned non-JSON response: ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    const message = data.error && (data.error.message || data.error);
    throw new Error(message || `Image relay request failed: ${response.status}`);
  }

  const imagePayload = findImagePayload(data);
  if (!imagePayload) {
    throw new Error('Image relay response did not include an image');
  }

  return saveGeneratedImage(req, imagePayload);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

const imageUpload = multer({
  storage,
  limits: {
    fileSize: imageModelConfig.maxInputBytes
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    const mimeLooksLikeImage = file.mimetype && file.mimetype.startsWith('image/');

    if (!mimeLooksLikeImage && !allowedExts.has(ext)) {
      return cb(new Error('Only jpg, jpeg, png, gif and webp image files are allowed'));
    }
    cb(null, true);
  }
});

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/generated', express.static(generatedDir));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ai-pet-face-server',
    imageModel: {
      baseUrl: imageModelConfig.baseUrl,
      editPath: imageModelConfig.editPath,
      model: imageModelConfig.model,
      configured: Boolean(imageModelConfig.apiKey)
    },
    storage: {
      uploadsDir,
      generatedDir,
      reportsFile,
      generationsFile
    },
    ts: new Date().toISOString()
  });
});

app.post('/api/uploads/pet-image', imageUpload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an image' });
  }

  res.json({
    imageUrl: publicUrl(req, 'uploads', req.file.filename),
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
  const reports = readJsonFile(reportsFile, []);
  reports.unshift(report);
  writeJsonFile(reportsFile, reports);

  res.json({
    reportId: report.reportId,
    isPaid: report.isPaid,
    freeReport: report.freeReport,
    paidPreview: Object.keys(report.paidReport)
  });
});

app.get('/api/reports/:id', (req, res) => {
  const report = readJsonFile(reportsFile, []).find((item) => item.reportId === req.params.id);
  if (!report) return res.status(404).json({ error: 'report not found' });
  res.json(report);
});

app.post('/api/reports/:id/unlock', (req, res) => {
  const reports = readJsonFile(reportsFile, []);
  const report = reports.find((item) => item.reportId === req.params.id);

  if (!report) return res.status(404).json({ error: 'report not found' });

  report.isPaid = true;
  report.updatedAt = new Date().toISOString();
  writeJsonFile(reportsFile, reports);

  res.json({
    ok: true,
    report
  });
});

app.post('/api/image-generations', imageUpload.single('file'), async (req, res, next) => {
  try {
    const prompt = (req.body && req.body.prompt ? String(req.body.prompt) : '').trim();

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const inputImageUrl = publicUrl(req, 'uploads', req.file.filename);
    const generatedImageUrl = await callImageRelay(req, req.file, prompt);
    const record = {
      generationId: uuidv4(),
      prompt,
      inputImageUrl,
      generatedImageUrl,
      model: imageModelConfig.model,
      createdAt: new Date().toISOString()
    };
    const generations = readJsonFile(generationsFile, []);
    generations.unshift(record);
    writeJsonFile(generationsFile, generations);

    res.json(record);
  } catch (err) {
    next(err);
  }
});

app.post('/api/payments', (req, res) => {
  res.json({
    ok: true,
    mode: 'mock',
    message: 'Local MVP uses mock payment. Integrate WeChat Pay before production paid access.'
  });
});

app.post('/api/payments/wechat/callback', (req, res) => {
  res.json({ ok: true, message: 'wechat payment callback reserved' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `Image file is too large, max ${Math.round(imageModelConfig.maxInputBytes / 1024 / 1024)}MB` });
  }
  res.status(400).json({ error: err.message || 'bad request' });
});

app.listen(port, () => {
  console.log(`AI Pet Face server running at http://localhost:${port}`);
});
