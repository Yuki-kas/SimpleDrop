# SimpleDrop - 局域网文件传输应用

这是一个基于 WebRTC 技术的局域网文件传输 Web 应用，允许同一局域网内的设备互相发现并传输文件。

![效果图1](./assets/1.png)
![效果图2](./assets/2.png)
![效果图3](./assets/3.png)

## 功能特性

- 自动发现同一局域网内的其他设备
- 支持设备间的直接文件传输
- 支持多文件同时传输
- 支持拖拽上传文件
- 文件大小限制（单个文件最大 500MB）
- 大文件自动分块传输
- 实时传输进度显示
- 区分文件发送和接收状态
- 响应式设计，同时支持 PC 端和移动端
- 基本的安全保护（速率限制、安全头）
- 传输状态监控

## 技术栈

- 前端：React 18
- UI 框架：Material-UI 5
- 后端：Node.js + Express
- P2P 通信：PeerJS (WebRTC)
- 信令服务器：Socket.IO
- 安全：helmet, express-rate-limit

## 开发环境设置

1. 克隆项目

```bash
git clone https://github.com/yourusername/SimpleDrop.git
cd SimpleDrop
```

2. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

3. 配置环境变量

- 复制 `.env.development.example` 到 `.env.development`
- 修改 `REACT_APP_SERVER_URL` 为你的本机 IP 地址

4. 启动开发服务器

```bash
# 启动后端服务器
cd server
npm start

# 启动前端开发服务器（新终端）
cd client
npm start
```

## 使用说明

1. 确保所有设备都连接到同一个局域网
2. 在 PC 浏览器中访问 `http://localhost:3000`
3. 在移动设备浏览器中访问 `http://[你的IP]:3000`
4. 等待设备列表更新，显示其他在线设备
5. 选择目标设备并点击"选择文件发送"或拖拽文件到窗口
6. 选择要传输的文件，等待传输完成

## 特性说明

- 文件传输采用点对点（P2P）方式，数据不经过服务器
- 支持大文件传输，文件会被自动分块处理
- 文件大小超过 100MB 时自动调整分块大小
- 传输过程中显示实时进度
- 发送和接收状态使用不同颜色区分（蓝色为发送，红色为接收）
- 自动处理设备的连接和断开
- 支持同时传输多个文件，每个文件独立显示进度
- 服务器端有基本的安全保护和监控

## 安全特性

- 使用 helmet 添加安全相关的 HTTP 头
- 速率限制保护（每 IP 每 15 分钟最多 100 个请求）
- 文件大小限制（500MB）
- 基本的传输状态监控

## 注意事项

- 确保防火墙允许 3000 和 3001 端口的访问
- 某些浏览器可能需要允许 WebRTC 权限
- 建议使用现代浏览器（Chrome、Firefox、Safari 等）
- 大文件传输时请保持页面打开状态
- 注意单个文件大小限制（500MB）

## 监控和统计

可以通过访问 `/stats` 端点获取基本的传输统计信息：

- 总传输次数
- 成功传输次数
- 失败传输次数
- 总传输字节数

## 测试覆盖

项目使用 Jest 和 React Testing Library 进行组件测试。

### DeviceList 测试用例

- **基础渲染测试**

  - 验证设备列表正确渲染
  - 验证空列表状态显示
  - 验证设备类型图标显示

- **交互测试**

  - 验证设备选中状态高亮
  - 验证设备点击回调

- **设备类型测试**
  - 验证 PC 设备图标显示
  - 验证移动设备图标显示

### FileTransfer 测试用例

- **基础渲染测试**

  - 验证文件选择按钮渲染
  - 验证禁用状态显示

- **文件处理测试**
  - 验证文件大小限制（500MB）
  - 验证文件选择回调
  - 验证错误提示显示

## 测试规范

1. **选择器使用规范**

   - 优先使用 data-testid 属性
   - 设备列表项：`device-item-${id}`
   - 设备图标：`pc-device-icon-${id}` 或 `mobile-device-icon-${id}`
   - 文件输入：`file-input`
   - 空列表提示：`empty-device-list`

2. **测试用例编写要求**

   - 每个测试用例聚焦于单一功能点
   - 使用 beforeEach 清理 mock 函数
   - 提供清晰的测试描述
   - 验证用户可见的行为和状态

3. **Mock 数据规范**
   - 设备数据包含明确的类型标识（PC/Mobile）
   - 文件大小测试使用 Object.defineProperty

## 项目结构

```
.
├── client/
│   ├── src/
│   │   ├── components/          # React 组件
│   │   │   ├── DeviceList.js
│   │   │   └── FileTransfer.js
│   │   ├── __tests__/          # 测试文件
│   │   │   ├── DeviceList.test.js
│   │   │   └── FileTransfer.test.js
│   │   └── ...
├── server/
│   ├── config/                  # 服务器配置
│   └── ...
└── README.md
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件
