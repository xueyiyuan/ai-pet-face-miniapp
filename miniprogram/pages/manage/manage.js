const api = require('../../utils/api');

Page({
  data: {
    role: 'admin',
    type: 'all',
    tabs: [],
    tasks: [],
    canCreateRoom: true
  },

  onShow() {
    const app = getApp();
    const role = app.globalData.role || wx.getStorageSync('rental-role') || 'admin';
    this.setData({
      role,
      type: 'all',
      tabs: this.tabsForRole(role),
      canCreateRoom: role === 'admin' || role === 'collector'
    }, () => this.loadTasks());
  },

  loadTasks() {
    api.getTasks({ type: this.data.type, role: this.data.role }).then((data) => {
      this.setData({
        tasks: (data.tasks || []).map((task) => Object.assign({}, task, {
          typeText: this.typeText(task.type)
        }))
      });
    });
  },

  typeText(type) {
    return {
      collect: '收房',
      outbound: '出房',
      lease: '合同',
      rent: '租金'
    }[type] || '待办';
  },

  tabsForRole(role) {
    if (role === 'collector') {
      return [
        { key: 'all', label: '全部' },
        { key: 'collect', label: '收房' }
      ];
    }
    if (role === 'renter') {
      return [
        { key: 'all', label: '全部' },
        { key: 'outbound', label: '出房' },
        { key: 'lease', label: '合同' },
        { key: 'rent', label: '租金' }
      ];
    }
    if (role === 'admin') {
      return [
        { key: 'all', label: '全部' },
        { key: 'collect', label: '收房' },
        { key: 'outbound', label: '出房' },
        { key: 'lease', label: '合同' },
        { key: 'rent', label: '租金' }
      ];
    }
    return [
      { key: 'all', label: '全部' }
    ];
  },

  changeTab(event) {
    this.setData({ type: event.currentTarget.dataset.type }, () => this.loadTasks());
  },

  complete(event) {
    const id = event.currentTarget.dataset.id;
    api.completeTask(id, this.data.role).then(() => {
      wx.showToast({ title: '已处理', icon: 'success' });
      this.loadTasks();
    });
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
    wx.navigateTo({ url: '/pages/dashboard/dashboard' });
  },

  goMe() {
    wx.navigateTo({ url: '/pages/me/me' });
  }
});
