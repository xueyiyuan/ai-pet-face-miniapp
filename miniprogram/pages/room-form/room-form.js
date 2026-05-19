const api = require('../../utils/api');

Page({
  data: {
    form: {
      community: '',
      roomNo: '',
      address: '',
      layout: '1室1厅1卫',
      area: '',
      rent: '',
      owner: '',
      ownerPhone: '',
      notes: ''
    },
    submitting: false
  },

  input(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: event.detail.value });
  },

  submit() {
    const form = this.data.form;
    if (!form.community || !form.roomNo || !form.rent) {
      wx.showToast({ title: '请填写小区、房号、租金', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    api.createRoom({
      ...form,
      title: `${form.community} ${form.roomNo}`,
      area: Number(form.area || 45),
      rent: Number(form.rent || 0),
      status: 'pending',
      statusText: '待审核',
      facilities: ['新录入', '待验房']
    }).then((room) => {
      wx.showToast({ title: '已新增', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/room/room?id=${room.id}` });
      }, 500);
    }).finally(() => {
      this.setData({ submitting: false });
    });
  }
});
