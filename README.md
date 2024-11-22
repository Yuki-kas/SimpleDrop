# SimpleDrop - 局域网文件传输应用

这是一个基于 WebRTC 技术的局域网文件传输 Web 应用，允许同一局域网内的设备互相发现并传输文件（还在完善中 ...）。

## 功能特性

- 自动发现同一局域网内的其他设备
- 支持设备间的直接文件传输
- 支持多种文件类型
- 实时传输进度显示
- 区分文件发送和接收状态
- 响应式设计，同时支持 PC 端和移动端

## 技术栈

- 前端：React 18
- UI 框架：Material-UI 5
- 后端：Node.js + Express
- P2P 通信：PeerJS (WebRTC)
- 信令服务器：Socket.IO

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
5. 选择目标设备并点击"选择文件发送"
6. 选择要传输的文件，等待传输完成

## 特性说明

- 文件传输采用点对点（P2P）方式，数据不经过服务器
- 支持大文件传输，文件会被分块处理
- 传输过程中显示实时进度
- 发送和接收状态使用不同颜色区分（蓝色为发送，红色为接收）
- 自动处理设备的连接和断开

## 注意事项

- 确保防火墙允许 3000 和 3001 端口的访问
- 某些浏览器可能需要允许 WebRTC 权限
- 建议使用现代浏览器（Chrome、Firefox、Safari 等）
- 大文件传输时请保持页面打开状态

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License
