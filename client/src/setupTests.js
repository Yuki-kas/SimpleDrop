import { act } from 'react';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// 配置测试超时时间
jest.setTimeout(10000);

// 模拟 WebRTC
global.RTCPeerConnection = jest.fn();
global.RTCSessionDescription = jest.fn();
global.RTCIceCandidate = jest.fn();

// 模拟 Socket.IO
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const connect = jest.fn();
  const disconnect = jest.fn();
  
  return jest.fn(() => ({
    emit,
    on,
    connect,
    disconnect,
    connected: false
  }));
});

// 模拟 PeerJS
jest.mock('peerjs', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    destroy: jest.fn()
  }));
});

// 添加全局 act
global.act = act; 