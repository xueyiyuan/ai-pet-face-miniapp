# AI 宠物面相小程序

一个本地可运行的微信小程序 MVP：上传宠物照片，生成娱乐化的宠物面相报告，并支持模拟解锁完整版。

## 结构

- `miniprogram/`：微信小程序前端
- `server/`：本地 Node.js 后端
- `docs/`：产品和接口说明

## 启动后端

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

默认地址是 `http://localhost:3000`。

## 启动小程序

1. 用微信开发者工具打开 `miniprogram` 目录
2. 确认后端已启动
3. 在开发者工具里直接预览运行

## 功能

- 上传宠物图片
- 生成免费版面相报告
- 模拟解锁完整版
- 支持分享报告

## 接口

- `GET /health`
- `POST /api/uploads/pet-image`
- `POST /api/reports`
- `GET /api/reports/:id`
- `POST /api/reports/:id/unlock`

## 说明

这是一个可运行的本地 MVP。当前使用文件存储和模拟支付，后续可再接入云存储、真实 AI 模型和微信支付。
