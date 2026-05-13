const app = getApp();

Page({
  data: {
    imagePath: '',
    petName: '',
    loading: false
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ imagePath: res.tempFiles[0].tempFilePath });
      }
    });
  },

  onNameInput(e) {
    this.setData({ petName: e.detail.value });
  },

  createReport() {
    if (!this.data.imagePath) {
      wx.showToast({ title: '请先选择照片', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    // MVP 阶段先用本地临时路径模拟 imageUrl。
    // 正式版这里应先 wx.uploadFile 到后端/云存储，再把远程 imageUrl 发给 /api/reports。
    wx.request({
      url: `${app.globalData.apiBase}/api/reports`,
      method: 'POST',
      data: {
        imageUrl: this.data.imagePath,
        petName: this.data.petName || '主子',
        petType: 'unknown'
      },
      success: (res) => {
        const reportId = res.data && res.data.reportId;
        if (!reportId) {
          wx.showToast({ title: '生成失败', icon: 'none' });
          return;
        }
        wx.navigateTo({ url: `/pages/report/report?id=${reportId}` });
      },
      fail: () => wx.showToast({ title: '后端未启动或网络异常', icon: 'none' }),
      complete: () => this.setData({ loading: false })
    });
  }
});
