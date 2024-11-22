import React, { useState, useEffect, useRef } from 'react';
import { Container, CssBaseline, Box } from '@mui/material';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import DeviceList from './components/DeviceList';
import FileTransfer from './components/FileTransfer';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || window.location.hostname;
const SERVER_PORT = process.env.REACT_APP_SERVER_PORT || 3001;
const FULL_SERVER_URL = `http://${SERVER_URL}:${SERVER_PORT}`;

console.log('初始化连接配置:', {
  serverUrl: SERVER_URL,
  serverPort: SERVER_PORT,
  fullUrl: FULL_SERVER_URL
});

const socket = io(FULL_SERVER_URL, {
  transports: ['polling'],
  reconnection: false,
  autoConnect: false
});

function App() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [peerInstance, setPeerInstance] = useState(null);
  const [processingFiles, setProcessingFiles] = useState(new Set());
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionAttemptRef = useRef(0);
  const [fileChunks, setFileChunks] = useState({});
  const [isReceiving, setIsReceiving] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');

  const handleIncomingFile = React.useCallback((data) => {
    const { fileName, data: fileData, currentChunk, totalChunks } = data;
    const fileKey = `${fileName}_${totalChunks}`;

    setIsReceiving(true);
    setCurrentFileName(fileName);

    setFileChunks(prevChunks => {
      const newChunks = { ...prevChunks };
      
      if (!newChunks[fileKey]) {
        newChunks[fileKey] = {
          chunks: new Array(totalChunks),
          processedChunks: new Set()
        };
      }
      
      if (newChunks[fileKey].processedChunks.has(currentChunk)) {
        return prevChunks;
      }

      newChunks[fileKey].chunks[currentChunk] = fileData;
      newChunks[fileKey].processedChunks.add(currentChunk);
      
      const receivedCount = newChunks[fileKey].processedChunks.size;
      console.log(`文件 ${fileName} 进度: ${receivedCount}/${totalChunks}`);
      
      setTransferProgress((receivedCount / totalChunks) * 100);

      if (receivedCount === totalChunks) {
        console.log('文件接收完成，开始组装:', fileName);
        
        const completeFile = new Blob(newChunks[fileKey].chunks);
        const url = URL.createObjectURL(completeFile);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);

        delete newChunks[fileKey];
        setTransferProgress(0);
        setIsReceiving(false);
        setCurrentFileName('');
      }

      return newChunks;
    });
  }, []);

  const handleSocketConnect = React.useCallback(() => {
    console.log('Socket连接成功:', {
      id: socket.id,
      time: new Date().toISOString()
    });
    
    const peer = new Peer(undefined, {  // 让 PeerJS 自动生成 ID
      host: SERVER_URL,
      port: SERVER_PORT,
      path: '/peerjs/myapp',
      debug: 3,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', (id) => {
      console.log('Peer连接成功:', {
        peerId: id,
        socketId: socket.id
      });
      setPeerInstance(peer);

      const deviceInfo = {
        deviceName: `设备_${Math.random().toString(36).substr(2, 4)}`,
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? '移动设备' : 'PC设备',
        timestamp: Date.now(),
        peerId: id  // 使用 peer 生成的 ID
      };
      
      socket.emit('register-device', deviceInfo);
    });

    peer.on('connection', (conn) => {
      console.log('收到peer连接:', {
        peer: conn.peer,
        metadata: conn.metadata
      });
      conn.on('data', handleIncomingFile);
    });

    peer.on('error', (error) => {
      console.error('Peer错误:', error);
      if (error.type === 'peer-unavailable' || error.type === 'disconnected') {
        peer.destroy();
        setPeerInstance(null);
      }
    });

    return peer;
  }, [handleIncomingFile]);

  useEffect(() => {
    let isCleanup = false;
    let currentPeer = null;

    const registerDevice = () => {
      const deviceInfo = {
        deviceName: `设备_${Math.random().toString(36).substr(2, 4)}`,
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? '移动设备' : 'PC设备',
        timestamp: Date.now()
      };
      
      socket.emit('register-device', deviceInfo);
    };

    socket.on('connect', () => {
      console.log('Socket连接成功:', socket.id);
      currentPeer = handleSocketConnect();
      registerDevice();
    });

    socket.on('devices-update', (updatedDevices) => {
      if (!isCleanup && socket.id) {
        const otherDevices = updatedDevices.filter(
          device => device.socketId !== socket.id
        );
        setDevices(otherDevices);
      }
    });

    socket.on('disconnect', () => {
      if (!isCleanup) {
        setDevices([]);
        setSelectedDevice(null);
        if (currentPeer) {
          currentPeer.destroy();
          setPeerInstance(null);
        }
      }
    });

    if (!socket.connected && !isCleanup) {
      socket.connect();
    }

    return () => {
      isCleanup = true;
      setDevices([]);
      setSelectedDevice(null);
      if (currentPeer) {
        currentPeer.destroy();
        setPeerInstance(null);
      }
      socket.disconnect();
    };
  }, [handleSocketConnect]);

  const handleFileSelect = async (file) => {
    if (!selectedDevice || !file || !peerInstance) {
      console.log('无法发送文件:', { 
        hasSelectedDevice: !!selectedDevice, 
        hasFile: !!file,
        hasPeer: !!peerInstance,
        myPeerId: peerInstance?.id,
        targetPeerId: selectedDevice?.peerId
      });
      return;
    }

    try {
      console.log('开始连接peer:', {
        targetPeerId: selectedDevice.peerId,
        myPeerId: peerInstance.id,
        peerStatus: peerInstance.open ? 'open' : 'closed'
      });

      if (!peerInstance.open) {
        console.log('等待 peer 连接打开...');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Peer连接超时')), 5000);
          const checkOpen = setInterval(() => {
            if (peerInstance.open) {
              clearInterval(checkOpen);
              clearTimeout(timeout);
              resolve();
            }
          }, 100);
        });
      }

      const conn = peerInstance.connect(selectedDevice.peerId, {
        reliable: true
      });

      conn.on('open', () => {
        console.log('Peer连接已打开，开始传输文件');
        const chunkSize = 16384;
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;

        const reader = new FileReader();
        
        reader.onerror = (error) => {
          console.error('文件读取错误:', error);
        };

        reader.onload = (e) => {
          try {
            conn.send({
              fileName: file.name,
              data: e.target.result,
              currentChunk,
              totalChunks: chunks
            });
            
            currentChunk++;
            setTransferProgress((currentChunk / chunks) * 100);

            if (currentChunk < chunks) {
              const nextSlice = file.slice(
                currentChunk * chunkSize,
                (currentChunk + 1) * chunkSize
              );
              reader.readAsArrayBuffer(nextSlice);
            } else {
              console.log('文件发送完成');
              setTimeout(() => {
                setTransferProgress(0);
                setCurrentFileName('');
              }, 1000);
            }
          } catch (error) {
            console.error('发送文件数据错误:', error);
          }
        };

        const firstSlice = file.slice(0, chunkSize);
        reader.readAsArrayBuffer(firstSlice);
      });

      conn.on('error', (error) => {
        console.error('文件传输错误:', error);
      });

      conn.on('close', () => {
        console.log('Peer连接已关闭');
      });

    } catch (error) {
      console.error('创建peer连接失败:', error);
      setCurrentFileName('');
      setTransferProgress(0);
    }
  };

  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <Box sx={{ my: 4 }}>
        <DeviceList
          devices={devices}
          selectedDevice={selectedDevice}
          onDeviceSelect={setSelectedDevice}
        />
        <FileTransfer
          onFileSelect={handleFileSelect}
          transferProgress={transferProgress}
          selectedDevice={selectedDevice}
          isReceiving={isReceiving}
          currentFileName={currentFileName}
        />
      </Box>
    </Container>
  );
}

export default App; 