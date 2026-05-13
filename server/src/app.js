require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;
const reports = new Map();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ai-pet-face-server', ts: new Date().toISOString() });
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

app.listen(port, () => {
  console.log(`AI Pet Face server running at http://localhost:${port}`);
});
