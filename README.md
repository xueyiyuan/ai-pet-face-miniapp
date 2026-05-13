# AI 宠物面相小程序

一个面向铲屎官的娱乐化 AI 小程序：上传猫狗照片，生成宠物性格、它对主人的看法、福气运势、健康观察提示和分享海报。

> 注意：所有报告仅供娱乐，不构成医学、命理、行为学或诊断建议。

## 工程结构

```text
ai-pet-face-miniapp/
├─ miniprogram/          # 微信小程序前端
│  ├─ pages/
│  │  ├─ index/          # 首页
│  │  ├─ upload/         # 上传/分析页
│  │  └─ report/         # 报告页
│  ├─ app.js
│  ├─ app.json
│  └─ app.wxss
├─ server/               # 后端 API 服务
│  ├─ src/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  └─ app.js
│  ├─ package.json
│  └─ .env.example
├─ docs/                 # 产品/接口文档
└─ scripts/              # 辅助脚本
```

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

默认接口地址：`http://localhost:3000`

### 2. 打开小程序

用微信开发者工具导入 `miniprogram` 目录。

开发阶段可在微信开发者工具中关闭合法域名校验，或把后端部署到 HTTPS 域名。

## MVP 功能

- 上传宠物照片
- AI 生成娱乐化宠物面相报告
- 免费报告 / 付费报告字段拆分
- 分享文案和分享海报预留
- 微信支付接口预留

## 下一步

1. 接入真实图片上传存储：腾讯云 COS / 微信云存储 / 阿里云 OSS
2. 接入视觉大模型：豆包视觉 / 通义千问 VL / GLM-4V / GPT-4o
3. 接入微信登录和微信支付
4. 增加 Canvas 海报生成
5. 上线前补充隐私政策、用户协议和内容审核
