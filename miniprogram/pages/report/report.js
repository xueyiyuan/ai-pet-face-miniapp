const app = getApp();
const adConfig = require('../../config/ad');

let unlockRewardedVideoAd = null;

Page({
  data: {
    id: '',
    report: null,
    loading: true,
    unlocking: false,
    error: '',
    adConfig
  },

  onLoad(query) {
    this.setData({ id: query.id || '' });
    this.fetchReport();
  },

  onReady() {
    this.initUnlockAd();
  },

  initUnlockAd() {
    const adUnitId = adConfig.rewardedUnlockAdUnitId;
    if (!adUnitId || !wx.createRewardedVideoAd) return;

    unlockRewardedVideoAd = wx.createRewardedVideoAd({ adUnitId });
    unlockRewardedVideoAd.onError((err) => {
      console.error('unlock rewarded video ad error:', err);
    });
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

    if (!unlockRewardedVideoAd) {
      this.requestUnlock();
      return;
    }

    unlockRewardedVideoAd.offClose();
    unlockRewardedVideoAd.onClose((res) => {
      if (res && res.isEnded) {
        this.requestUnlock();
      } else {
        wx.showToast({ title: '看完广告后可解锁', icon: 'none' });
      }
    });

    unlockRewardedVideoAd.show().catch(() => {
      unlockRewardedVideoAd.load()
        .then(() => unlockRewardedVideoAd.show())
        .catch(() => {
          wx.showToast({ title: '广告暂不可用', icon: 'none' });
        });
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
