# AI 图片生成小程序

一个本地可运行的微信小程序 MVP：可以上传任意照片并输入文字，通过后端配置的 OpenAI 兼容中转站模型生成新图片；同时保留原来的宠物面相报告功能。

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

## 配置图片生成模型

后端图片生成配置文件在：

```text
server/src/config/imageModel.js
```

不要把密钥写死在代码里，建议在 `server/.env` 中配置：

```env
PUBLIC_BASE_URL=https://你的后端域名
IMAGE_RELAY_BASE_URL=https://你的中转站域名/v1
IMAGE_RELAY_API_KEY=你的中转站key
IMAGE_RELAY_MODEL=gpt-image-2
IMAGE_RELAY_EDIT_PATH=/images/edits
IMAGE_RELAY_SIZE=1024x1024
IMAGE_RELAY_OUTPUT_FORMAT=png
```

中转站需要兼容 OpenAI Image API 的 `POST /v1/images/edits` 形态。

## 启动小程序

1. 用微信开发者工具打开 `miniprogram` 目录
2. 确认后端已启动
3. 在开发者工具里直接预览运行

## 功能

- 上传任意照片并输入文字生成图片
- 上传宠物图片
- 生成免费版面相报告
- 模拟解锁完整版
- 支持分享报告

## 接口

- `GET /health`
- `POST /api/image-generations`
- `POST /api/uploads/pet-image`
- `POST /api/reports`
- `GET /api/reports/:id`
- `POST /api/reports/:id/unlock`

## 说明

这是一个可运行的本地 MVP。当前生成图片会保存到 `server/generated/`，上传原图保存到 `server/uploads/`，历史记录保存到 `server/data/`。
