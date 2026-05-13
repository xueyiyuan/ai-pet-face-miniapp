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
    this.uploadPetImage()
      .then((imageUrl) => this.requestCreateReport(imageUrl))
      .then((reportId) => {
        wx.navigateTo({ url: `/pages/report/report?id=${reportId}` });
      })
      .catch((err) => {
        console.error('create report failed:', err);
        wx.showToast({ title: err.message || '生成失败', icon: 'none' });
      })
      .finally(() => this.setData({ loading: false }));
  },

  uploadPetImage() {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.apiBase}/api/uploads/pet-image`,
        filePath: this.data.imagePath,
        name: 'file',
        formData: {
          petName: this.data.petName || '主子'
        },
        success: (res) => {
          let data = {};
          try {
            data = JSON.parse(res.data || '{}');
          } catch (err) {
            reject(new Error('上传接口返回异常'));
            return;
          }

          if (res.statusCode < 200 || res.statusCode >= 300 || !data.imageUrl) {
            reject(new Error(data.error || '图片上传失败'));
            return;
          }

          resolve(data.imageUrl);
        },
        fail: () => reject(new Error('图片上传失败，请确认后端已启动'))
      });
    });
  },

  requestCreateReport(imageUrl) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.apiBase}/api/reports`,
        method: 'POST',
        data: {
          imageUrl,
          petName: this.data.petName || '主子',
          petType: 'unknown'
        },
        success: (res) => {
          const reportId = res.data && res.data.reportId;
          if (!reportId) {
            reject(new Error((res.data && res.data.error) || '报告生成失败'));
            return;
          }
          resolve(reportId);
        },
        fail: () => reject(new Error('报告生成失败，请确认后端已启动'))
      });
    });
  }
});
