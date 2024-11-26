# SimpleDrop API 文档

本文档描述了 SimpleDrop 应用的所有服务器端 API。

## 基础信息

- 基础URL: `http://[your-server]:3001`
- 所有请求默认使用 JSON 格式
- 所有时间戳使用 ISO 8601 格式

## Socket.IO 事件

### 连接事件

#### 客户端连接
```javascript
// 客户端代码
socket.connect();
```

#### 设备注册
```javascript
// 发送
socket.emit('register-device', {
  deviceName: string,    // 设备名称
  deviceType: string,    // 设备类型（'移动设备' 或 'PC设备'）
  timestamp: number,     // 时间戳
  peerId: string        // PeerJS ID
});

// 接收
socket.on('register-success', {
  yourId: string,       // Socket ID
  totalDevices: number  // 当前在线设备数
});
```

#### 设备列表更新
```javascript
socket.on('devices-update', devices => {
  // devices: Array<{
  //   socketId: string,    // Socket ID
  //   deviceName: string,  // 设备名称
  //   deviceType: string,  // 设备类型
  //   peerId: string,      // PeerJS ID
  //   lastSeen: number     // 最后在线时间
  // }>
});
```

### 心跳机制

```javascript
// 发送心跳
socket.emit('heartbeat');
```

## HTTP 端点

### 获取传输统计信息

```http
GET /stats
```

响应示例：
```json
{
  "totalTransfers": 100,      // 总传输次数
  "successfulTransfers": 95,  // 成功传输次数
  "failedTransfers": 5,       // 失败传输次数
  "totalBytes": 1024000      // 总传输字节数
}
```

### 健康检查

```http
GET /health
```

响应示例：
```json
{
  "status": "ok",
  "connections": 5,    // 当前连接数
  "devices": 3        // 当前在线设备数
}
```

## PeerJS 连接

### 建立连接

```javascript
const peer = new Peer(undefined, {
  host: SERVER_URL,
  port: SERVER_PORT,
  path: '/peerjs/myapp',
  debug: 3,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  }
});
```

### 文件传输格式

发送文件数据格式：
```typescript
interface FileChunk {
  fileId: string;          // 文件唯一标识
  fileName: string;        // 文件名
  data: ArrayBuffer;       // 文件数据块
  currentChunk: number;    // 当前块序号
  totalChunks: number;     // 总块数
}
```

## 安全限制

- 速率限制：每个 IP 每 15 分钟最多 100 个请求
- 文件大小限制：单个文件最大 500MB
- 使用 helmet 中间件添加���全头

## 错误处理

所有错误响应格式：
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

常见错误代码：
- `RATE_LIMIT_EXCEEDED`: 超过速率限制
- `FILE_TOO_LARGE`: 文件大小超过限制
- `PEER_CONNECTION_FAILED`: 对等连接失败
- `DEVICE_NOT_FOUND`: 目标设备不存在

## WebSocket 状态码

- 1000: 正常关闭
- 1001: 终端离开
- 1002: 协议错误
- 1003: 数据类型错误
- 1006: 异常关闭
- 1007: 数据类型不一致
- 1008: 策略违规
- 1009: 消息太大
- 1010: 需要扩展
- 1011: 意外情况
- 1012: 服务重启
- 1013: 服务过载
- 1014: 网关超时
- 1015: TLS 握手失败

## 开发者工具

### 监控端点

```http
GET /debug/connections  // 获取当前连接信息
GET /debug/transfers   // 获取传输统计
GET /debug/errors     // 获取错误日志
```

### 测试工具

提供了一个测试客户端，可用于测试文件传输：
```bash
npm run test-client
```

## 部署注意事项

1. 确保防火墙开放以下端口：
   - 3000: 前端服务
   - 3001: 后端服务
   - 3001/ws: WebSocket 连接

2. 环境变量配置：
```env
NODE_ENV=production
PORT=3001
MAX_FILE_SIZE=524288000  # 500MB in bytes
RATE_LIMIT_WINDOW=900000 # 15 minutes in milliseconds
RATE_LIMIT_MAX=100
```

## 更新日志

### v1.0.0
- 初始版本发布
- 基本的文件传输功能
- 设备发现功能

### v1.1.0
- 添加多文件传输支持
- 添加文件拖拽上传
- 添加基本的安全特性 