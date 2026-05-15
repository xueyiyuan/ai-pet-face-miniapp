const app = getApp();

Page({
  data: {
    id: '',
    report: null,
    loading: true,
    unlocking: false,
    error: ''
  },

  onLoad(query) {
    this.setData({ id: query.id || '' });
    this.fetchReport();
  },

  fetchReport() {
    if (!this.data.id) {
      this.setData({ loading: false, error: '缺少报告 ID' });
      return;
    }

    this.setData({ loading: true, error: '' });
    wx.request({
      url: `${app.globalData.apiBase}/api/reports/${this.data.id}`,
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300 || !res.data || res.data.error) {
          this.setData({ report: null, error: (res.data && res.data.error) || '读取报告失败' });
          return;
        }
        this.setData({ report: res.data });
      },
      fail: () => {
        this.setData({ report: null, error: '读取失败，请确认后端已启动' });
      },
      complete: () => this.setData({ loading: false })
    });
  },

  unlock() {
    if (this.data.unlocking || !this.data.id) return;

    wx.showModal({
      title: '模拟解锁',
      content: '本地 MVP 会直接展示完整版；上线前请替换为微信支付。',
      confirmText: '解锁',
      success: (modalRes) => {
        if (!modalRes.confirm) return;
        this.requestUnlock();
      }
    });
  },

  requestUnlock() {
    this.setData({ unlocking: true });
    wx.request({
      url: `${app.globalData.apiBase}/api/reports/${this.data.id}/unlock`,
      method: 'POST',
      success: (res) => {
        const report = res.data && res.data.report;
        if (res.statusCode < 200 || res.statusCode >= 300 || !report) {
          wx.showToast({ title: (res.data && res.data.error) || '解锁失败', icon: 'none' });
          return;
        }
        this.setData({ report });
        wx.showToast({ title: '已解锁', icon: 'success' });
      },
      fail: () => wx.showToast({ title: '解锁失败，请确认后端已启动', icon: 'none' }),
      complete: () => this.setData({ unlocking: false })
    });
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/upload/upload' });
  },

  onShareAppMessage() {
    const report = this.data.report;
    return {
      title: report ? report.freeReport.shareText : '看看你家宠物的隐藏气质',
      path: '/pages/index/index'
    };
  }
});
