require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = Number(process.env.PORT || 3010);
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'rental-mvp.json');

fs.mkdirSync(dataDir, { recursive: true });

const seedData = {
  rooms: [
    {
      id: 'room-403',
      title: '中辉样板 403',
      community: '中辉样板',
      address: '广东省深圳市宝安区西乡街道 188 号',
      layout: '1室1厅1卫',
      area: 52.75,
      floor: '4/18',
      direction: '南',
      status: 'renting',
      statusText: '出租中',
      rent: 3000,
      totalCost: 360000,
      profit: 10,
      owner: '刘先生',
      ownerPhone: '13888888888',
      tenant: '李女士',
      tenantPhone: '13666666666',
      collector: 'A业务员',
      renter: '出租员张',
      nextRentDate: '2026-07-02',
      image: '/assets/rooms/room-1.jpg',
      facilities: ['冰箱', '洗衣机', '独立卫浴', '采光大窗'],
      notes: '近地铁，精装可拎包入住，适合白领单人或情侣。'
    },
    {
      id: 'room-188',
      title: '前海公寓 188',
      community: '前海公寓',
      address: '广东省深圳市南山区前海路 188 号',
      layout: '2室1厅1卫',
      area: 67.2,
      floor: '12/28',
      direction: '东南',
      status: 'available',
      statusText: '待出租',
      rent: 4200,
      totalCost: 520000,
      profit: 14,
      owner: '王女士',
      ownerPhone: '13999999999',
      tenant: '',
      tenantPhone: '',
      collector: 'B业务员',
      renter: '出租员李',
      nextRentDate: '',
      image: '/assets/rooms/room-2.jpg',
      facilities: ['阳台', '智能门锁', '燃气灶', '双人床'],
      notes: '通勤便利，适合小家庭，当前空置可立即带看。'
    },
    {
      id: 'room-805',
      title: '海岸城 805',
      community: '海岸城',
      address: '广东省深圳市南山区海德三道 68 号',
      layout: '1室0厅1卫',
      area: 38.5,
      floor: '8/21',
      direction: '西南',
      status: 'pending',
      statusText: '待审核',
      rent: 2800,
      totalCost: 300000,
      profit: 8,
      owner: '陈先生',
      ownerPhone: '13777777777',
      tenant: '',
      tenantPhone: '',
      collector: '收房员周',
      renter: '',
      nextRentDate: '',
      image: '/assets/rooms/room-3.jpg',
      facilities: ['热水器', '衣柜', '写字桌'],
      notes: '收房资料待补齐，需管理员审核后上架。'
    },
    {
      id: 'room-520',
      title: '青年社区 520',
      community: '青年社区',
      address: '广东省深圳市龙华区民治大道 520 号',
      layout: '3室2厅2卫',
      area: 95,
      floor: '3/27',
      direction: '南北',
      status: 'available',
      statusText: '待出租',
      rent: 6000,
      totalCost: 680000,
      profit: 16,
      owner: '孙先生',
      ownerPhone: '13555555555',
      tenant: '',
      tenantPhone: '',
      collector: '收房员赵',
      renter: '出租员张',
      nextRentDate: '',
      image: '/assets/rooms/room-4.jpg',
      facilities: ['三房整租', '双卫', '大阳台', '客餐厅'],
      notes: '适合合租或家庭整租，租金弹性空间大。'
    }
  ],
  tasks: [
    {
      id: 'task-lease-1',
      type: 'lease',
      title: '中辉样板 403 合同待确认',
      roomId: 'room-403',
      roomTitle: '中辉样板 403',
      assigneeRole: 'renter',
      amount: 3000,
      customer: '李女士',
      dueAt: '2026-07-02 18:18',
      status: 'pending',
      statusText: '待确认'
    },
    {
      id: 'task-out-1',
      type: 'outbound',
      title: '前海公寓 188 待出房',
      roomId: 'room-188',
      roomTitle: '前海公寓 188',
      assigneeRole: 'renter',
      amount: 4200,
      customer: '待匹配租客',
      dueAt: '2026-07-03 10:00',
      status: 'pending',
      statusText: '待处理'
    },
    {
      id: 'task-collect-1',
      type: 'collect',
      title: '海岸城 805 收房资料待补齐',
      roomId: 'room-805',
      roomTitle: '海岸城 805',
      assigneeRole: 'collector',
      amount: 2800,
      customer: '陈先生',
      dueAt: '2026-07-01 15:30',
      status: 'pending',
      statusText: '待处理'
    },
    {
      id: 'task-rent-1',
      type: 'rent',
      title: '中辉样板 403 本月租金待收',
      roomId: 'room-403',
      roomTitle: '中辉样板 403',
      assigneeRole: 'admin',
      amount: 3000,
      customer: '李女士',
      dueAt: '2026-07-02 18:18',
      status: 'pending',
      statusText: '未交租'
    }
  ],
  ledgers: [
    { id: 'ledger-1', type: 'income', label: '租金收入', amount: 123600, month: '2026-07' },
    { id: 'ledger-2', type: 'expense', label: '收房支出', amount: 52630, month: '2026-07' },
    { id: 'ledger-3', type: 'deposit', label: '押金', amount: 12360, month: '2026-07' },
    { id: 'ledger-4', type: 'profit', label: '利润', amount: 58610, month: '2026-07' }
  ]
};

function cloneSeedData() {
  return JSON.parse(JSON.stringify(seedData));
}

function readStore() {
  if (!fs.existsSync(dataFile)) {
    writeStore(seedData);
    return cloneSeedData();
  }

  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (err) {
    console.error('Failed to read rental MVP store:', err);
    return cloneSeedData();
  }
}

function writeStore(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

function money(value) {
  return Number(value || 0);
}

function buildDashboard(data) {
  const renting = data.rooms.filter((room) => room.status === 'renting').length;
  const available = data.rooms.filter((room) => room.status === 'available').length;
  const pending = data.rooms.filter((room) => room.status === 'pending').length;
  const income = data.ledgers.find((item) => item.type === 'income')?.amount || 0;
  const expense = data.ledgers.find((item) => item.type === 'expense')?.amount || 0;
  const profit = data.ledgers.find((item) => item.type === 'profit')?.amount || 0;

  return {
    stats: [
      { label: '总房源', value: data.rooms.length, unit: '套' },
      { label: '在租', value: renting, unit: '套' },
      { label: '空置', value: available, unit: '套' },
      { label: '待办', value: data.tasks.filter((task) => task.status === 'pending').length, unit: '项' }
    ],
    finance: { income, expense, profit, month: '2026 年 7 月' },
    occupancy: [
      { label: '在租', value: renting },
      { label: '空置', value: available },
      { label: '待审', value: pending }
    ],
    bars: [
      { label: '支出', value: expense, height: 46 },
      { label: '收入', value: income, height: 92 },
      { label: '押金', value: 12360, height: 24 },
      { label: '利润', value: profit, height: 58 }
    ]
  };
}

function normalizeRole(role) {
  return ['visitor', 'admin', 'investor', 'collector', 'renter'].includes(role) ? role : 'visitor';
}

function filterRoomsByRole(rooms, role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'admin' || normalizedRole === 'investor') return rooms;
  if (normalizedRole === 'visitor') {
    return rooms.filter((room) => room.status === 'available' || room.status === 'renting');
  }
  if (normalizedRole === 'collector') {
    return rooms.filter((room) => room.status === 'pending' || String(room.collector || '').includes('收房员'));
  }
  if (normalizedRole === 'renter') {
    return rooms.filter((room) => room.status === 'available' || room.status === 'renting' || Boolean(room.renter));
  }

  return [];
}

function filterTasksByRole(tasks, role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'admin') return tasks;
  if (normalizedRole === 'collector') {
    return tasks.filter((task) => task.assigneeRole === 'collector' || task.type === 'collect');
  }
  if (normalizedRole === 'renter') {
    return tasks.filter((task) => task.assigneeRole === 'renter' || ['outbound', 'lease', 'rent'].includes(task.type));
  }

  return [];
}

function sanitizeRoomForRole(room, role) {
  const normalizedRole = normalizeRole(role);
  const publicRoom = {
    id: room.id,
    title: room.title,
    community: room.community,
    address: room.address,
    layout: room.layout,
    area: room.area,
    floor: room.floor,
    direction: room.direction,
    status: room.status,
    statusText: room.statusText,
    rent: room.rent,
    image: room.image,
    facilities: room.facilities,
    notes: room.notes
  };

  if (normalizedRole === 'visitor') {
    return {
      ...publicRoom,
      profit: undefined,
      totalCost: undefined,
      owner: '平台管家',
      ownerPhone: '',
      tenant: '',
      tenantPhone: '',
      collector: '',
      renter: '',
      nextRentDate: ''
    };
  }

  if (normalizedRole === 'investor') {
    return {
      ...room,
      owner: '已脱敏',
      ownerPhone: '',
      tenant: room.tenant ? '已脱敏' : '',
      tenantPhone: ''
    };
  }

  if (normalizedRole === 'collector') {
    return {
      ...room,
      tenant: room.tenant ? '已脱敏' : '',
      tenantPhone: '',
      nextRentDate: ''
    };
  }

  if (normalizedRole === 'renter') {
    return {
      ...room,
      owner: room.owner ? '已脱敏' : '',
      ownerPhone: '',
      totalCost: undefined
    };
  }

  return room;
}

function dashboardForRole(data, role) {
  const normalizedRole = normalizeRole(role);
  const scopedData = {
    ...data,
    rooms: filterRoomsByRole(data.rooms, normalizedRole),
    tasks: filterTasksByRole(data.tasks, normalizedRole)
  };
  const dashboard = buildDashboard(scopedData);

  if (normalizedRole === 'visitor') {
    dashboard.finance = { income: 0, expense: 0, profit: 0, month: dashboard.finance.month };
    dashboard.bars = [];
  } else if (normalizedRole === 'collector') {
    dashboard.finance = {
      income: 0,
      expense: data.ledgers.find((item) => item.type === 'expense')?.amount || 0,
      profit: 0,
      month: dashboard.finance.month
    };
  } else if (normalizedRole === 'renter') {
    dashboard.finance = {
      income: data.ledgers.find((item) => item.type === 'income')?.amount || 0,
      expense: 0,
      profit: 0,
      month: dashboard.finance.month
    };
  }

  return dashboard;
}

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ziroom-style-rental-mvp',
    dataFile,
    ts: new Date().toISOString()
  });
});

app.get('/api/bootstrap', (req, res) => {
  const data = readStore();
  const role = normalizeRole(req.query.role || 'admin');
  res.json({
    roles: [
      { key: 'visitor', name: '访客', desc: '看房、收藏、预约' },
      { key: 'admin', name: '管理员', desc: '统计、房源、财务' },
      { key: 'investor', name: '投资人', desc: '收益、出租率' },
      { key: 'collector', name: '收房员', desc: '收房工单、录入' },
      { key: 'renter', name: '出租员', desc: '出房、合同、租客' }
    ],
    dashboard: dashboardForRole(data, role)
  });
});

app.get('/api/dashboard', (req, res) => {
  const role = normalizeRole(req.query.role || 'admin');
  res.json(dashboardForRole(readStore(), role));
});

app.get('/api/rooms', (req, res) => {
  const { keyword = '', status = 'all' } = req.query;
  const role = normalizeRole(req.query.role || 'visitor');
  const normalizedKeyword = String(keyword).trim().toLowerCase();
  let rooms = filterRoomsByRole(readStore().rooms, role);

  if (status !== 'all') {
    rooms = rooms.filter((room) => room.status === status);
  }

  if (normalizedKeyword) {
    rooms = rooms.filter((room) => {
      return [room.title, room.community, room.address, room.owner, room.tenant]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
    });
  }

  res.json({ rooms: rooms.map((room) => sanitizeRoomForRole(room, role)) });
});

app.get('/api/rooms/:id', (req, res) => {
  const role = normalizeRole(req.query.role || 'visitor');
  const room = filterRoomsByRole(readStore().rooms, role).find((item) => item.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'room not found' });
  res.json(sanitizeRoomForRole(room, role));
});

app.post('/api/rooms', (req, res) => {
  const role = normalizeRole(req.query.role || (req.body && req.body.role) || 'visitor');
  if (role !== 'admin' && role !== 'collector') {
    return res.status(403).json({ error: 'current role cannot create rooms' });
  }

  const data = readStore();
  const payload = req.body || {};
  const room = {
    id: `room-${Date.now().toString(36)}`,
    title: payload.title || `${payload.community || '新房源'} ${payload.roomNo || ''}`.trim(),
    community: payload.community || '新录入小区',
    address: payload.address || '待补充地址',
    layout: payload.layout || '1室1厅1卫',
    area: Number(payload.area || 45),
    floor: payload.floor || '中楼层',
    direction: payload.direction || '南',
    status: payload.status || 'pending',
    statusText: payload.statusText || '待审核',
    rent: money(payload.rent || 3000),
    totalCost: money(payload.totalCost || 0),
    profit: money(payload.profit || 0),
    owner: payload.owner || '待补充',
    ownerPhone: payload.ownerPhone || '',
    tenant: '',
    tenantPhone: '',
    collector: payload.collector || '收房员',
    renter: payload.renter || '',
    nextRentDate: '',
    image: payload.image || '/assets/rooms/room-2.jpg',
    facilities: Array.isArray(payload.facilities) ? payload.facilities : ['待补充配置'],
    notes: payload.notes || '新录入房源，等待补齐资料和审核。'
  };

  data.rooms.unshift(room);
  data.tasks.unshift({
    id: `task-${uuidv4()}`,
    type: 'collect',
    title: `${room.title} 新房源待审核`,
    roomId: room.id,
    roomTitle: room.title,
    assigneeRole: 'admin',
    amount: room.rent,
    customer: room.owner,
    dueAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: 'pending',
    statusText: '待审核'
  });
  writeStore(data);

  res.status(201).json(room);
});

app.patch('/api/rooms/:id', (req, res) => {
  const role = normalizeRole(req.query.role || (req.body && req.body.role) || 'visitor');
  if (role !== 'admin' && role !== 'collector' && role !== 'renter') {
    return res.status(403).json({ error: 'current role cannot update rooms' });
  }

  const data = readStore();
  const room = data.rooms.find((item) => item.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'room not found' });

  Object.assign(room, req.body || {});
  writeStore(data);
  res.json(room);
});

app.get('/api/tasks', (req, res) => {
  const { type = 'all', role = 'all' } = req.query;
  let tasks = role === 'all' ? readStore().tasks : filterTasksByRole(readStore().tasks, role);

  if (type !== 'all') tasks = tasks.filter((task) => task.type === type);

  res.json({ tasks });
});

app.patch('/api/tasks/:id/complete', (req, res) => {
  const data = readStore();
  const role = normalizeRole(req.query.role || (req.body && req.body.role) || 'visitor');
  const task = filterTasksByRole(data.tasks, role).find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'task not found' });

  task.status = 'done';
  task.statusText = '已处理';
  task.completedAt = new Date().toISOString();
  writeStore(data);
  res.json(task);
});

app.get('/api/finance/summary', (req, res) => {
  const role = normalizeRole(req.query.role || 'admin');
  const data = readStore();
  res.json({
    month: '2026 年 7 月',
    ledger: role === 'admin' || role === 'investor' ? data.ledgers : [],
    dashboard: dashboardForRole(data, role)
  });
});

app.post('/api/demo/reset', (req, res) => {
  writeStore(seedData);
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'bad request' });
});

app.listen(port, () => {
  console.log(`Ziroom-style rental MVP server running at http://localhost:${port}`);
});
