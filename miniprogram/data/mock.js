const rooms = [
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
  }
];

const tasks = [
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
  }
];

const dashboard = {
  stats: [
    { label: '总房源', value: 3, unit: '套' },
    { label: '在租', value: 1, unit: '套' },
    { label: '空置', value: 1, unit: '套' },
    { label: '待办', value: 3, unit: '项' }
  ],
  finance: { income: 123600, expense: 52630, profit: 58610, month: '2026 年 7 月' },
  occupancy: [
    { label: '在租', value: 1 },
    { label: '空置', value: 1 },
    { label: '待审', value: 1 }
  ],
  bars: [
    { label: '支出', value: 52630, height: 46 },
    { label: '收入', value: 123600, height: 92 },
    { label: '押金', value: 12360, height: 24 },
    { label: '利润', value: 58610, height: 58 }
  ]
};

const roles = [
  { key: 'visitor', name: '访客', desc: '看房、收藏、预约' },
  { key: 'admin', name: '管理员', desc: '统计、房源、财务' },
  { key: 'investor', name: '投资人', desc: '收益、出租率' },
  { key: 'collector', name: '收房员', desc: '收房工单、录入' },
  { key: 'renter', name: '出租员', desc: '出房、合同、租客' }
];

module.exports = {
  rooms,
  tasks,
  dashboard,
  roles
};
