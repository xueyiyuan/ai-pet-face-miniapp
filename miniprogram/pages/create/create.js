const app = getApp();

Page({
  data: {
    imagePath: '',
    prompt: '',
    generatedImageUrl: '',
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

  onPromptInput(e) {
    this.setData({ prompt: e.detail.value });
  },

  generateImage() {
    const prompt = this.data.prompt.trim();

    if (!this.data.imagePath) {
      wx.showToast({ title: '请先选择照片', icon: 'none' });
      return;
    }
    if (!prompt) {
      wx.showToast({ title: '请输入生成要求', icon: 'none' });
      return;
    }
    if (this.data.loading) return;

    this.setData({ loading: true, generatedImageUrl: '' });
    wx.showLoading({ title: '生成中' });

    wx.uploadFile({
      url: `${app.globalData.apiBase}/api/image-generations`,
      filePath: this.data.imagePath,
      name: 'file',
      formData: {
        prompt
      },
      success: (res) => {
        let data = {};
        try {
          data = JSON.parse(res.data || '{}');
        } catch (err) {
          wx.showToast({ title: '接口返回异常', icon: 'none' });
          return;
        }

        if (res.statusCode < 200 || res.statusCode >= 300 || !data.generatedImageUrl) {
          wx.showToast({ title: data.error || '生成失败', icon: 'none' });
          return;
        }

        this.setData({ generatedImageUrl: data.generatedImageUrl });
        wx.showToast({ title: '生成成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '请求失败，请确认后端已启动', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ loading: false });
      }
    });
  },

  previewResult() {
    if (!this.data.generatedImageUrl) return;
    wx.previewImage({
      urls: [this.data.generatedImageUrl],
      current: this.data.generatedImageUrl
    });
  }
});
