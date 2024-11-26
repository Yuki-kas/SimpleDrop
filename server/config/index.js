const defaultConfig = require('./default');
const developmentConfig = require('./development');
const productionConfig = require('./production');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const env = process.env.NODE_ENV || 'development';

// 深度合并对象
const mergeDeep = (target, source) => {
  const isObject = (obj) => obj && typeof obj === 'object';
  
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
};

// 根据环境选择配置
const envConfig = env === 'production' ? productionConfig : developmentConfig;

// 合并配置
const config = mergeDeep(
  mergeDeep({}, defaultConfig),
  envConfig
);

// 允许通过环境变量覆盖配置
const overrideWithEnv = (obj, prefix = '') => {
  Object.keys(obj).forEach(key => {
    const envKey = prefix ? `${prefix}_${key}`.toUpperCase() : key.toUpperCase();
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      overrideWithEnv(obj[key], envKey);
    } else if (process.env[envKey] !== undefined) {
      obj[key] = process.env[envKey];
      // 转换布尔值和数字
      if (process.env[envKey] === 'true') obj[key] = true;
      if (process.env[envKey] === 'false') obj[key] = false;
      if (!isNaN(process.env[envKey])) obj[key] = Number(process.env[envKey]);
    }
  });
};

overrideWithEnv(config);

module.exports = config; 