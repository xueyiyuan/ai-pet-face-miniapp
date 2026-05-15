const app = getApp();

Page({
  data: {
    imagePath: '',
    petName: '',
    petType: 'cat',
    loading: false
  },

  chooseImage() {
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const file = res.tempFiles && res.tempFiles[0];
          if (file) this.setData({ imagePath: file.tempFilePath });
        }
      });
      return;
    }

    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFilePaths && res.tempFilePaths[0];
        if (path) this.setData({ imagePath: path });
      }
    });
  },

  onNameInput(e) {
    this.setData({ petName: e.detail.value });
  },

  selectPetType(e) {
    this.setData({ petType: e.currentTarget.dataset.type });
  },

  createReport() {
    if (this.data.loading) return;

    if (!this.data.imagePath) {
      wx.showToast({ title: '请先选择照片', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '生成中' });

    this.uploadPetImage()
      .then((imageUrl) => this.requestCreateReport(imageUrl))
      .then((reportId) => {
        wx.navigateTo({ url: `/pages/report/report?id=${reportId}` });
      })
      .catch((err) => {
        console.error('create report failed:', err);
        wx.showToast({ title: err.message || '生成失败', icon: 'none' });
      })
      .finally(() => {
        wx.hideLoading();
        this.setData({ loading: false });
      });
  },

  uploadPetImage() {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.apiBase}/api/uploads/pet-image`,
        filePath: this.data.imagePath,
        name: 'file',
        formData: {
          petName: this.data.petName || '小主子'
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
          petName: this.data.petName || '小主子',
          petType: this.data.petType
        },
        success: (res) => {
          const reportId = res.data && res.data.reportId;
          if (res.statusCode < 200 || res.statusCode >= 300 || !reportId) {
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
