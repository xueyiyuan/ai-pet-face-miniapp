const mock = require('../data/mock');

function baseUrl() {
  const app = getApp();
  return (app.globalData.rentalApiBase || 'http://localhost:3010').replace(/\/$/, '');
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl()}${path}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(new Error((res.data && res.data.error) || `HTTP ${res.statusCode}`));
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

function offlineRooms(params = {}) {
  const keyword = (params.keyword || '').trim();
  const status = params.status || 'all';
  let rooms = getLocalRooms();

  if (status !== 'all') {
    rooms = rooms.filter((room) => room.status === status);
  }

  if (keyword) {
    rooms = rooms.filter((room) => {
      return [room.title, room.community, room.address].some((value) => value.indexOf(keyword) >= 0);
    });
  }

  return { rooms };
}

function withFallback(promise, fallback) {
  return promise.catch(() => Promise.resolve(typeof fallback === 'function' ? fallback() : fallback));
}

function getLocalRooms() {
  return (wx.getStorageSync('rental-local-rooms') || []).concat(mock.rooms);
}

function saveLocalRoom(room) {
  const rooms = wx.getStorageSync('rental-local-rooms') || [];
  wx.setStorageSync('rental-local-rooms', [room].concat(rooms));
}

module.exports = {
  getBootstrap() {
    return withFallback(request('/api/bootstrap'), {
      roles: mock.roles,
      dashboard: mock.dashboard
    });
  },

  getDashboard() {
    return withFallback(request('/api/dashboard'), mock.dashboard);
  },

  getRooms(params = {}) {
    const query = `?keyword=${encodeURIComponent(params.keyword || '')}&status=${encodeURIComponent(params.status || 'all')}`;
    return withFallback(request(`/api/rooms${query}`), () => offlineRooms(params));
  },

  getRoom(id) {
    return withFallback(request(`/api/rooms/${id}`), () => getLocalRooms().find((room) => room.id === id) || mock.rooms[0]);
  },

  createRoom(data) {
    return withFallback(request('/api/rooms', { method: 'POST', data }), () => {
      const room = {
        id: `local-${Date.now()}`,
        title: data.title,
        community: data.community,
        roomNo: data.roomNo,
        address: data.address,
        layout: data.layout,
        area: data.area,
        rent: data.rent,
        owner: data.owner,
        notes: data.notes,
        image: '/assets/rooms/room-2.jpg',
        status: 'pending',
        statusText: '待审核',
        totalCost: 0,
        profit: 0,
        floor: '中楼层',
        direction: '南',
        ownerPhone: data.ownerPhone || '',
        tenant: '',
        tenantPhone: '',
        collector: '收房员',
        renter: '',
        facilities: data.facilities || ['新录入', '待验房']
      };
      saveLocalRoom(room);
      return room;
    });
  },

  getTasks(params = {}) {
    const query = `?type=${encodeURIComponent(params.type || 'all')}&role=${encodeURIComponent(params.role || 'all')}`;
    return withFallback(request(`/api/tasks${query}`), { tasks: mock.tasks });
  },

  completeTask(id) {
    return withFallback(request(`/api/tasks/${id}/complete`, { method: 'PATCH' }), { id, status: 'done', statusText: '已处理' });
  }
};
