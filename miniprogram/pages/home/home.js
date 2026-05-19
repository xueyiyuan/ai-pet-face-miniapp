const api = require('../../utils/api');

Page({
  data: {
    role: 'admin',
    keyword: '',
    status: 'all',
    filters: [
      { key: 'all', label: '全部' },
      { key: 'renting', label: '已出租' },
      { key: 'available', label: '空置' },
      { key: 'pending', label: '待审核' }
    ],
    rooms: [],
    loading: false
  },

  onShow() {
    const app = getApp();
    this.setData({ role: app.globalData.role || wx.getStorageSync('rental-role') || 'admin' });
    this.loadRooms();
  },

  loadRooms() {
    this.setData({ loading: true });
    api.getRooms({ keyword: this.data.keyword, status: this.data.status }).then((data) => {
      this.setData({
        rooms: (data.rooms || []).map((room) => ({
          ...room,
          tagClass: room.status === 'renting' ? '' : room.status === 'available' ? 'orange' : 'gray'
        })),
        loading: false
      });
    });
  },

  inputKeyword(event) {
    this.setData({ keyword: event.detail.value });
  },

  search() {
    this.loadRooms();
  },

  changeFilter(event) {
    this.setData({ status: event.currentTarget.dataset.status }, () => this.loadRooms());
  },

  goRoom(event) {
    wx.navigateTo({ url: `/pages/room/room?id=${event.currentTarget.dataset.id}` });
  },

  goCreateRoom() {
    wx.navigateTo({ url: '/pages/room-form/room-form' });
  }
});
