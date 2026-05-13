# API 设计

## 健康检查

```http
GET /health
```

## 创建宠物报告

```http
POST /api/reports
Content-Type: application/json

{
  "imageUrl": "https://example.com/pet.jpg",
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
