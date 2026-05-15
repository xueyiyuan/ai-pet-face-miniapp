# API 设计

## 健康检查

```http
GET /health
```

## 生成图片

```http
POST /api/image-generations
Content-Type: multipart/form-data

file=<参考图片>
prompt=<生成描述>
```

后端会调用 `server/src/config/imageModel.js` 中配置的 OpenAI 兼容中转站，默认模型名为 `gpt-image-2`。

返回：

```json
{
  "generationId": "uuid",
  "prompt": "把这张照片变成插画",
  "inputImageUrl": "https://example.com/uploads/input.png",
  "generatedImageUrl": "https://example.com/generated/output.png",
  "model": "gpt-image-2",
  "createdAt": "2026-05-15T00:00:00.000Z"
}
```

## 上传宠物图片

```http
POST /api/uploads/pet-image
Content-Type: multipart/form-data

file=<图片文件>
```

返回：

```json
{
  "imageUrl": "http://localhost:3000/uploads/xxx.png",
  "filename": "xxx.png",
  "originalName": "pet.png",
  "mimeType": "image/png",
  "size": 12345
}
```

## 创建报告

```http
POST /api/reports
Content-Type: application/json

{
  "imageUrl": "http://localhost:3000/uploads/xxx.png",
  "petName": "发财",
  "petType": "cat"
}
```

返回：

```json
{
  "reportId": "demo-report-id",
  "isPaid": false,
  "freeReport": {},
  "paidPreview": ["deepPersonality", "fortune", "relationship"]
}
```

## 获取报告

```http
GET /api/reports/:id
```

## 模拟解锁完整版

```http
POST /api/reports/:id/unlock
```

## 支付预留

```http
POST /api/payments
POST /api/payments/wechat/callback
```
