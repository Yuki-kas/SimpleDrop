const config = require('../config');

describe('配置加载测试', () => {
  test('应该加载默认配置', () => {
    expect(config).toHaveProperty('server');
    expect(config).toHaveProperty('security');
    expect(config).toHaveProperty('socket');
    expect(config).toHaveProperty('peer');
  });

  test('服务器配置应该有正确的属性', () => {
    expect(config.server).toHaveProperty('port');
    expect(config.server).toHaveProperty('host');
    expect(typeof config.server.port).toBe('number');
    expect(typeof config.server.host).toBe('string');
  });

  test('安全配置应该有正确的限制', () => {
    expect(config.security.maxFileSize).toBe(1024 * 1024 * 500); // 500MB
    expect(config.security.rateLimit.max).toBeGreaterThan(0);
  });

  test('环境变量应该能覆盖默认配置', () => {
    process.env.SERVER_PORT = '4000';
    const newConfig = require('../config');
    expect(newConfig.server.port).toBe(4000);
    delete process.env.SERVER_PORT;
  });

  test('无效的环境变量不应该影响配置', () => {
    process.env.INVALID_CONFIG = 'invalid';
    const newConfig = require('../config');
    expect(newConfig).not.toHaveProperty('INVALID_CONFIG');
    delete process.env.INVALID_CONFIG;
  });
}); 