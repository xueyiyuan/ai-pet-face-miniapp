const api = require('../../utils/api');

Page({
  data: {
    role: 'admin',
    dashboard: {
      stats: [],
      finance: {},
      occupancy: [],
      bars: []
    },
    totalRooms: 0
  },

  onShow() {
    const app = getApp();
    const role = app.globalData.role || wx.getStorageSync('rental-role') || 'admin';
    this.setData({ role });
    api.getDashboard(role).then((dashboard) => {
      const total = dashboard.stats && dashboard.stats[0] ? dashboard.stats[0].value : 0;
      this.setData({ dashboard, totalRooms: total });
    });
  }
});
