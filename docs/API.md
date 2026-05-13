# API 设计

## 健康检查

```http
GET /health
```

## 上传宠物图片

```http
POST /api/uploads/pet-image
Content-Type: multipart/form-data

file=<宠物图片文件>
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

限制：

- 仅允许图片文件
- 单文件最大 10MB
- 本地开发保存到 `server/uploads/`

## 创建宠物报告

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
  "paidPreview": ["deepPersonality", "fortune", "healthTips"]
}
```

## 获取报告

```http
GET /api/reports/:id
```

## 创建支付订单，预留

```http
POST /api/payments
```

## 支付回调，预留

```http
POST /api/payments/wechat/callback
```
