const api = require('../../utils/api');

Page({
  data: {
    roles: [],
    selected: 'admin'
  },

  onLoad() {
    api.getBootstrap().then((data) => {
      this.setData({
        roles: data.roles || [],
        selected: wx.getStorageSync('rental-role') || 'admin'
      });
    });
  },

  selectRole(event) {
    this.setData({ selected: event.currentTarget.dataset.role });
  },

  enterApp() {
    const app = getApp();
    app.globalData.role = this.data.selected;
    wx.setStorageSync('rental-role', this.data.selected);
    wx.switchTab({ url: '/pages/home/home' });
  }
});
