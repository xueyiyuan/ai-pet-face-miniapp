const app = getApp();

Page({
  data: {
    imagePath: '',
    prompt: '',
    generatedImageUrl: '',
    message: '',
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

    this.setData({ loading: true, generatedImageUrl: '', message: '图片已上传，正在请求模型生成，请稍等...' });
    wx.showLoading({ title: '生成中' });

    wx.uploadFile({
      url: `${app.globalData.apiBase}/api/image-generations`,
      filePath: this.data.imagePath,
      name: 'file',
      timeout: 180000,
      formData: {
        prompt
      },
      success: (res) => {
        let data = {};
        try {
          data = JSON.parse(res.data || '{}');
        } catch (err) {
          this.setData({ message: '后端返回的不是 JSON，请查看服务器日志。' });
          wx.showToast({ title: '接口返回异常', icon: 'none' });
          return;
        }

        if (res.statusCode < 200 || res.statusCode >= 300 || !data.generatedImageUrl) {
          const message = data.error || `生成失败，状态码 ${res.statusCode}`;
          this.setData({ message });
          wx.showModal({
            title: '生成失败',
            content: message,
            showCancel: false
          });
          return;
        }

        this.setData({ generatedImageUrl: data.generatedImageUrl, message: '生成成功' });
        wx.showToast({ title: '生成成功', icon: 'success' });
      },
      fail: (err) => {
        const message = err && err.errMsg ? err.errMsg : '请求失败，请确认后端已启动';
        this.setData({ message });
        wx.showModal({
          title: '请求失败',
          content: message,
          showCancel: false
        });
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
