const roleNames = {
  visitor: '访客',
  admin: '管理员',
  investor: '投资人',
  collector: '收房员',
  renter: '出租员'
};

Page({
  data: {
    role: 'admin',
    roleName: '管理员',
    avatar: '管',
    menus: [
      { label: '我的工单', target: 'manage' },
      { label: '房源管理', target: 'home' },
      { label: '收支统计', target: 'dashboard' },
      { label: '帮助与客服', target: 'service' }
    ]
  },

  onShow() {
    const app = getApp();
    const role = app.globalData.role || wx.getStorageSync('rental-role') || 'admin';
    const roleName = roleNames[role] || '管理员';
    this.setData({ role, roleName, avatar: roleName.slice(0, 1) });
  },

  openMenu(event) {
    const target = event.currentTarget.dataset.target;
    if (target === 'home') wx.navigateTo({ url: '/pages/home/home' });
    if (target === 'manage') wx.navigateTo({ url: '/pages/manage/manage' });
    if (target === 'dashboard') wx.navigateTo({ url: '/pages/dashboard/dashboard' });
    if (target === 'service') wx.showModal({ title: '客服热线', content: '0755-88888888', showCancel: false });
  },

  switchRole() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
