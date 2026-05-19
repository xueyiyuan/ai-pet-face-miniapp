App({
  globalData: {
    apiBase: 'https://aipet.szlucky.online',
    rentalApiBase: 'http://localhost:3010',
    role: 'admin'
  },

  onLaunch() {
    const role = wx.getStorageSync('rental-role') || 'admin';
    this.globalData.role = role;
  }
});
