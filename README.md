# 寓管家租房经营小程序 MVP

这是一个用于演示的“自如租房”风格小程序 MVP，面向二手房东经营场景。当前代码已经和原 AI 宠物功能解耦，只复用此仓库的小程序与 Node.js 脚手架。

## 功能

- 身份切换：访客、管理员、投资人、收房员、出租员
- 房源列表：搜索、状态筛选、房源卡片、详情页
- 经营统计：总房源、在租、空置、待办、月度收支
- 经营待办：收房、出房、合同、租金任务处理
- 房源录入：新增房源并生成待审核任务
- Mock 后端：本地 JSON 持久化，支持接口演示

## 目录

- `miniprogram/`：微信小程序前端
- `server/`：本地 Node.js/Express mock 后端
- `miniprogram/assets/rooms/`：演示房源图片

## 启动后端

```bash
cd server
npm install
npm run dev
```

默认地址：`http://localhost:3010`

## 启动小程序

1. 用微信开发者工具打开 `miniprogram` 目录
2. 开启“不校验合法域名”
3. 确认后端已启动，或直接使用前端内置 mock 数据演示

## 主要接口

- `GET /health`
- `GET /api/bootstrap`
- `GET /api/dashboard`
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `POST /api/rooms`
- `GET /api/tasks`
- `PATCH /api/tasks/:id/complete`
- `POST /api/demo/reset`
