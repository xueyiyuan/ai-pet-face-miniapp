Page({
  goCreate() {
    wx.navigateTo({ url: '/pages/create/create' });
  },

  goUpload() {
    wx.navigateTo({ url: '/pages/upload/upload' });
  },

  goRental() {
    wx.navigateTo({ url: '/pages/home/home' });
  }
});
