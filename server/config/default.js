module.exports = {
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0'
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 每个IP的最大请求数
    },
    maxFileSize: 1024 * 1024 * 500, // 500MB
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  },
  socket: {
    transports: ['polling'],
    pingTimeout: 30000,
    pingInterval: 10000
  },
  peer: {
    path: '/myapp',
    debug: true,
    alive_timeout: 60000
  },
  monitoring: {
    enabled: true,
    logLevel: 'info'
  }
}; 