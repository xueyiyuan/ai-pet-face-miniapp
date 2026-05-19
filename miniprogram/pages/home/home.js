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
    emptyVisible: false,
    canCreateRoom: true,
    canViewDashboard: true,
    canViewManage: true
  },

  onShow() {
    const app = getApp();
    const role = app.globalData.role || wx.getStorageSync('rental-role') || 'admin';
    this.setData({
      role,
      canCreateRoom: role === 'admin' || role === 'collector',
      canViewDashboard: role === 'admin' || role === 'investor' || role === 'collector' || role === 'renter',
      canViewManage: role === 'admin' || role === 'collector' || role === 'renter'
    });
    this.loadRooms();
  },

  loadRooms() {
    this.setData({ loading: true });
    api.getRooms({ keyword: this.data.keyword, status: this.data.status, role: this.data.role }).then((data) => {
      this.setData({
        rooms: (data.rooms || []).map((room) => Object.assign({}, room, {
          tagClass: room.status === 'renting' ? '' : room.status === 'available' ? 'orange' : 'gray',
          profitText: room.profit === undefined || room.profit === '' ? '权限不可见' : `收益率 ${room.profit}%`
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
    if (!this.data.canCreateRoom) {
      wx.showToast({ title: '当前身份无新增权限', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/room-form/room-form' });
  },

  goDashboard() {
    if (!this.data.canViewDashboard) {
      wx.showToast({ title: '当前身份无统计权限', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/dashboard/dashboard' });
  },

  goManage() {
    if (!this.data.canViewManage) {
      wx.showToast({ title: '当前身份无待办权限', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/manage/manage' });
  },

  goMe() {
    wx.navigateTo({ url: '/pages/me/me' });
  }
});
