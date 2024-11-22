const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);

app.use(cors());

// Socket.IO 配置
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['polling']
});

// PeerJS 配置
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/myapp'
});

app.use('/peerjs', peerServer);

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

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 