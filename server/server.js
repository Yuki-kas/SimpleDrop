const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const config = require('./config');

const app = express();
const server = http.createServer(app);

// 使用配置的 CORS 设置
app.use(cors(config.security.cors));

// Socket.IO 配置
const io = new Server(server, {
  cors: config.security.cors,
  ...config.socket
});

// PeerJS 配置
const peerServer = ExpressPeerServer(server, config.peer);

app.use('/peerjs', peerServer);

// 使用配置的速率限制
const limiter = rateLimit(config.security.rateLimit);
app.use(limiter);

// 存储在线设备
const onlineDevices = new Map();

io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 处理设备注册
  socket.on('register-device', (deviceInfo) => {
    console.log('注册设备:', {
      socketId: socket.id,
      deviceInfo
    });

    // 如果设备已存在，先移除旧的
    if (onlineDevices.has(socket.id)) {
      onlineDevices.delete(socket.id);
    }

    // 注册新设备，确保包含 peerId
    onlineDevices.set(socket.id, {
      ...deviceInfo,
      socketId: socket.id,
      lastSeen: Date.now()
    });

    console.log('当前在线设备:', Array.from(onlineDevices.values()));

    // 广播更新后的设备列表
    io.emit('devices-update', Array.from(onlineDevices.values()));
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    if (onlineDevices.has(socket.id)) {
      onlineDevices.delete(socket.id);
      io.emit('devices-update', Array.from(onlineDevices.values()));
    }
  });
});

app.use(helmet());

// 添加基本的监控
const transferStats = {
  totalTransfers: 0,
  successfulTransfers: 0,
  failedTransfers: 0,
  totalBytes: 0
};

// 添加API端点获取统计信息
app.get('/stats', (req, res) => {
  res.json(transferStats);
});

// 导出 app 实例供测试使用
module.exports = app;

// 只在直接运行时启动服务器
if (require.main === module) {
  server.listen(config.server.port, config.server.host, () => {
    console.log(`服务器运行在 ${config.server.host}:${config.server.port}`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  });
} 