module.exports = {
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0'
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 50
    },
    maxFileSize: 1024 * 1024 * 500,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST']
    }
  },
  socket: {
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
  },
  peer: {
    path: '/myapp',
    debug: false,
    alive_timeout: 120000
  },
  monitoring: {
    enabled: true,
    logLevel: 'error'
  }
}; 