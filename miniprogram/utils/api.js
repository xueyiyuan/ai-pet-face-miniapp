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
  let rooms = filterRoomsByRole(getLocalRooms(), params.role || 'visitor');

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

function filterRoomsByRole(rooms, role) {
  if (role === 'admin' || role === 'investor') return rooms;
  if (role === 'visitor') return rooms.filter((room) => room.status === 'available' || room.status === 'renting').map((room) => maskRoom(room, role));
  if (role === 'collector') return rooms.filter((room) => room.status === 'pending' || String(room.collector || '').indexOf('收房员') >= 0).map((room) => maskRoom(room, role));
  if (role === 'renter') return rooms.filter((room) => room.status === 'available' || room.status === 'renting' || room.renter).map((room) => maskRoom(room, role));
  return [];
}

function maskRoom(room, role) {
  if (role === 'visitor') {
    return Object.assign({}, room, {
      owner: '平台管家',
      ownerPhone: '',
      tenant: '',
      tenantPhone: '',
      totalCost: '',
      profit: '',
      collector: '',
      renter: ''
    });
  }
  if (role === 'investor') {
    return Object.assign({}, room, {
      owner: '已脱敏',
      ownerPhone: '',
      tenant: room.tenant ? '已脱敏' : '',
      tenantPhone: ''
    });
  }
  if (role === 'collector') {
    return Object.assign({}, room, {
      tenant: room.tenant ? '已脱敏' : '',
      tenantPhone: ''
    });
  }
  if (role === 'renter') {
    return Object.assign({}, room, {
      owner: room.owner ? '已脱敏' : '',
      ownerPhone: '',
      totalCost: ''
    });
  }
  return room;
}

function offlineDashboard(role) {
  const rooms = filterRoomsByRole(mock.rooms, role || 'visitor');
  const tasks = filterTasksByRole(mock.tasks, role || 'visitor');
  return Object.assign({}, mock.dashboard, {
    stats: [
      { label: '可见房源', value: rooms.length, unit: '套' },
      { label: '在租', value: rooms.filter((room) => room.status === 'renting').length, unit: '套' },
      { label: '空置', value: rooms.filter((room) => room.status === 'available').length, unit: '套' },
      { label: '待办', value: tasks.length, unit: '项' }
    ]
  });
}

function filterTasksByRole(tasks, role) {
  if (role === 'admin') return tasks;
  if (role === 'collector') return tasks.filter((task) => task.assigneeRole === 'collector' || task.type === 'collect');
  if (role === 'renter') return tasks.filter((task) => task.assigneeRole === 'renter' || ['outbound', 'lease', 'rent'].indexOf(task.type) >= 0);
  return [];
}

module.exports = {
  getBootstrap() {
    const role = getApp().globalData.role || wx.getStorageSync('rental-role') || 'visitor';
    return withFallback(request(`/api/bootstrap?role=${encodeURIComponent(role)}`), {
      roles: mock.roles,
      dashboard: offlineDashboard(role)
    });
  },

  getDashboard(role) {
    return withFallback(request(`/api/dashboard?role=${encodeURIComponent(role || 'visitor')}`), offlineDashboard(role || 'visitor'));
  },

  getRooms(params = {}) {
    const query = `?keyword=${encodeURIComponent(params.keyword || '')}&status=${encodeURIComponent(params.status || 'all')}&role=${encodeURIComponent(params.role || 'visitor')}`;
    return withFallback(request(`/api/rooms${query}`), () => offlineRooms(params));
  },

  getRoom(id, role) {
    return withFallback(request(`/api/rooms/${id}?role=${encodeURIComponent(role || 'visitor')}`), () => filterRoomsByRole(getLocalRooms(), role || 'visitor').find((room) => room.id === id) || mock.rooms[0]);
  },

  createRoom(data) {
    const role = getApp().globalData.role || wx.getStorageSync('rental-role') || 'visitor';
    return withFallback(request(`/api/rooms?role=${encodeURIComponent(role)}`, { method: 'POST', data }), () => {
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
    return withFallback(request(`/api/tasks${query}`), { tasks: filterTasksByRole(mock.tasks, params.role || 'visitor') });
  },

  completeTask(id, role) {
    return withFallback(request(`/api/tasks/${id}/complete?role=${encodeURIComponent(role || 'visitor')}`, { method: 'PATCH' }), { id, status: 'done', statusText: '已处理' });
  }
};
