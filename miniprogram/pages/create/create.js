const app = getApp();

Page({
  data: {
    imagePath: '',
    prompt: '',
    generatedImageUrl: '',
    generationId: '',
    message: '',
    loading: false
  },

  onUnload() {
    this.clearPolling();
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

    this.clearPolling();
    this.setData({
      loading: true,
      generatedImageUrl: '',
      generationId: '',
      message: '图片正在上传，马上开始生成...'
    });
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
          this.finishWithError('后端返回的不是 JSON，请查看服务器日志。');
          return;
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const message = data.error || `生成失败，状态码 ${res.statusCode}`;
          this.finishWithError(message);
          return;
        }

        if (data.generatedImageUrl) {
          this.setData({ generatedImageUrl: data.generatedImageUrl, loading: false, message: '生成成功' });
          wx.hideLoading();
          wx.showToast({ title: '生成成功', icon: 'success' });
          return;
        }

        if (!data.generationId) {
          this.finishWithError('后端没有返回任务 ID');
          return;
        }

        this.setData({
          generationId: data.generationId,
          message: '任务已提交，模型生成可能需要几分钟...'
        });
        this.pollGeneration(data.generationId, Date.now());
      },
      fail: (err) => {
        const message = err && err.errMsg ? err.errMsg : '请求失败，请确认后端已启动';
        this.finishWithError(message);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  pollGeneration(generationId, startedAt) {
    this.clearPolling();

    this.pollingTimer = setTimeout(() => {
      wx.request({
        url: `${app.globalData.apiBase}/api/image-generations/${generationId}`,
        method: 'GET',
        timeout: 15000,
        success: (res) => {
          const data = res.data || {};

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const message = data.error || `查询任务失败，状态码 ${res.statusCode}`;
            this.finishWithError(message);
            return;
          }

          if (data.status === 'succeeded' && data.generatedImageUrl) {
            this.clearPolling();
            this.setData({
              generatedImageUrl: data.generatedImageUrl,
              loading: false,
              message: '生成成功'
            });
            wx.showToast({ title: '生成成功', icon: 'success' });
            return;
          }

          if (data.status === 'failed') {
            this.finishWithError(data.error || '模型生成失败');
            return;
          }

          const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
          this.setData({
            message: `模型正在生成中，已等待 ${elapsedSeconds} 秒...`
          });

          if (elapsedSeconds > 420) {
            this.finishWithError('生成等待超过 7 分钟，请稍后重试或检查中转站状态');
            return;
          }

          this.pollGeneration(generationId, startedAt);
        },
        fail: (err) => {
          const message = err && err.errMsg ? err.errMsg : '查询任务失败';
          this.finishWithError(message);
        }
      });
    }, 3000);
  },

  clearPolling() {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  },

  finishWithError(message) {
    this.clearPolling();
    wx.hideLoading();
    this.setData({
      loading: false,
      message
    });
    wx.showModal({
      title: '生成失败',
      content: message,
      showCancel: false
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
