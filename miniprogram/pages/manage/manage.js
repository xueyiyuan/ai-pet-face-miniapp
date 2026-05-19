const api = require('../../utils/api');

Page({
  data: {
    role: 'admin',
    type: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'collect', label: '收房' },
      { key: 'outbound', label: '出房' },
      { key: 'lease', label: '合同' },
      { key: 'rent', label: '租金' }
    ],
    tasks: []
  },

  onShow() {
    const app = getApp();
    this.setData({ role: app.globalData.role || wx.getStorageSync('rental-role') || 'admin' });
    this.loadTasks();
  },

  loadTasks() {
    api.getTasks({ type: this.data.type, role: this.data.role }).then((data) => {
      this.setData({
        tasks: (data.tasks || []).map((task) => ({
          ...task,
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

  changeTab(event) {
    this.setData({ type: event.currentTarget.dataset.type }, () => this.loadTasks());
  },

  complete(event) {
    const id = event.currentTarget.dataset.id;
    api.completeTask(id).then(() => {
      wx.showToast({ title: '已处理', icon: 'success' });
      this.loadTasks();
    });
  },

  goRoom(event) {
    wx.navigateTo({ url: `/pages/room/room?id=${event.currentTarget.dataset.id}` });
  },

  goCreateRoom() {
    wx.navigateTo({ url: '/pages/room-form/room-form' });
  }
});
