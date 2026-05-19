const api = require('../../utils/api');

Page({
  data: {
    room: {},
    id: ''
  },

  onLoad(options) {
    this.setData({ id: options.id || 'room-403' });
    this.loadRoom();
  },

  loadRoom() {
    api.getRoom(this.data.id).then((room) => {
      this.setData({
        room: Object.assign({}, room, {
          tagClass: room.status === 'renting' ? '' : room.status === 'available' ? 'orange' : 'gray',
          renterText: room.renter || '待分配',
          tenantText: room.tenant || '暂无',
          tenantPhoneText: room.tenantPhone || '空置中'
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
    wx.navigateTo({ url: '/pages/manage/manage' });
  }
});
