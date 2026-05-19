const api = require('../../utils/api');

Page({
  data: {
    role: 'admin',
    keyword: '',
    status: 'all',
    filters: [
      { key: 'all', label: '全部', activeClass: 'active' },
      { key: 'renting', label: '已出租', activeClass: '' },
      { key: 'available', label: '空置', activeClass: '' },
      { key: 'pending', label: '待审核', activeClass: '' }
    ],
    rooms: [],
    loading: false,
    emptyVisible: false
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
        rooms: (data.rooms || []).map((room) => Object.assign({}, room, {
          tagClass: room.status === 'renting' ? '' : room.status === 'available' ? 'orange' : 'gray'
        })),
        loading: false,
        emptyVisible: !(data.rooms || []).length
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
    const status = event.currentTarget.dataset.status;
    this.setData({
      status,
      filters: this.data.filters.map((item) => Object.assign({}, item, {
        activeClass: item.key === status ? 'active' : ''
      }))
    }, () => this.loadRooms());
  },

  goRoom(event) {
    wx.navigateTo({ url: `/pages/room/room?id=${event.currentTarget.dataset.id}` });
  },

  goCreateRoom() {
    wx.navigateTo({ url: '/pages/room-form/room-form' });
  },

  goDashboard() {
    wx.navigateTo({ url: '/pages/dashboard/dashboard' });
  },

  goManage() {
    wx.navigateTo({ url: '/pages/manage/manage' });
  },

  goMe() {
    wx.navigateTo({ url: '/pages/me/me' });
  }
});
