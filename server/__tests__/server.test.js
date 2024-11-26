const request = require('supertest');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const app = require('../server');

describe('服务器API测试', () => {
  let io, serverSocket, clientSocket, httpServer;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll((done) => {
    // 清理所有连接和服务器
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    io.close(() => {
      httpServer.close(done);
    });
  });

  afterEach(() => {
    // 清理测试数据
    jest.clearAllMocks();
  });

  test('应该能获取统计信息', async () => {
    const response = await request(app).get('/stats');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalTransfers');
    expect(response.body).toHaveProperty('successfulTransfers');
    expect(response.body).toHaveProperty('failedTransfers');
  });

  test('设备注册应该工作正常', (done) => {
    const deviceInfo = {
      deviceName: 'Test Device',
      deviceType: 'PC设备',
      timestamp: Date.now()
    };

    clientSocket.emit('register-device', deviceInfo);

    serverSocket.on('register-device', (data) => {
      expect(data).toMatchObject(deviceInfo);
      done();
    });
  });

  test('设备断开连接应该从列表中移除', (done) => {
    const deviceInfo = {
      deviceName: 'Test Device',
      deviceType: 'PC设备'
    };

    clientSocket.emit('register-device', deviceInfo);
    
    setTimeout(() => {
      clientSocket.disconnect();
      
      // 等待设备列表更新
      setTimeout(() => {
        const devices = Array.from(onlineDevices.values());
        expect(devices).not.toContainEqual(expect.objectContaining(deviceInfo));
        done();
      }, 100);
    }, 100);
  });

  test('重复注册同一设备应该更新信息', (done) => {
    const deviceInfo1 = {
      deviceName: 'Device 1',
      deviceType: 'PC设备'
    };

    const deviceInfo2 = {
      deviceName: 'Updated Device',
      deviceType: 'PC设备'
    };

    clientSocket.emit('register-device', deviceInfo1);
    
    setTimeout(() => {
      clientSocket.emit('register-device', deviceInfo2);
      
      setTimeout(() => {
        const devices = Array.from(onlineDevices.values());
        expect(devices).toContainEqual(expect.objectContaining(deviceInfo2));
        expect(devices).not.toContainEqual(expect.objectContaining(deviceInfo1));
        done();
      }, 100);
    }, 100);
  });
}); 