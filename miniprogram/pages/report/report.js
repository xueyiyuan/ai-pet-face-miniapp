const app = getApp();

Page({
  data: {
    id: '',
    report: null
  },

  onLoad(query) {
    this.setData({ id: query.id || '' });
    this.fetchReport();
  },

  fetchReport() {
    if (!this.data.id) return;
    wx.request({
      url: `${app.globalData.apiBase}/api/reports/${this.data.id}`,
      success: (res) => this.setData({ report: res.data }),
      fail: () => wx.showToast({ title: '读取报告失败', icon: 'none' })
    });
  },

  unlock() {
    wx.showModal({
      title: '完整版预留',
      content: '这里后续接入微信支付，支付成功后展示 paidReport。',
      showCancel: false
    });
  },

  onShareAppMessage() {
    const report = this.data.report;
    return {
      title: report ? report.freeReport.shareText : '测测你家宠物是什么面相',
      path: '/pages/index/index'
    };
  }
});
