const api = require('../../utils/api');

Page({
  data: {
    room: {},
    id: '',
    role: 'visitor',
    canViewCost: false,
    canViewTasks: false
  },

  onLoad(options) {
    const app = getApp();
    const role = app.globalData.role || wx.getStorageSync('rental-role') || 'visitor';
    this.setData({
      id: options.id || 'room-403',
      role,
      canViewCost: role === 'admin' || role === 'investor',
      canViewTasks: role === 'admin' || role === 'collector' || role === 'renter'
    });
    this.loadRoom();
  },

  loadRoom() {
    api.getRoom(this.data.id, this.data.role).then((room) => {
      this.setData({
        room: Object.assign({}, room, {
          tagClass: room.status === 'renting' ? '' : room.status === 'available' ? 'orange' : 'gray',
          renterText: room.renter || '待分配',
          tenantText: room.tenant || '暂无',
          tenantPhoneText: room.tenantPhone || '权限不可见',
          ownerPhoneText: room.ownerPhone || '权限不可见',
          profitText: room.profit === undefined || room.profit === '' ? '权限不可见' : `${room.profit}%`,
          totalCostText: room.totalCost === undefined || room.totalCost === '' ? '权限不可见' : `¥${room.totalCost}`
        })
      });
    });
  },

  callOwner() {
    const phone = this.data.room.ownerPhone;
    if (!phone) return;
    wx.makePhoneCall({ phoneNumber: phone });
  },

  callTenant() {
    const phone = this.data.room.tenantPhone;
    if (!phone) {
      wx.showToast({ title: '暂无租客', icon: 'none' });
      return;
    }
    wx.makePhoneCall({ phoneNumber: phone });
  },

  openTask() {
    if (!this.data.canViewTasks) {
      wx.showToast({ title: '当前身份无待办权限', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/manage/manage' });
  }
});
