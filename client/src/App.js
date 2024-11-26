import React, { useState, useEffect, useRef } from 'react';
import { Container, CssBaseline, Box, Snackbar, Alert } from '@mui/material';
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
  const [error, setError] = useState(null);
  const [activeTransfers, setActiveTransfers] = useState({});

  const handleIncomingFile = React.useCallback((data) => {
    const { fileName, data: fileData, currentChunk, totalChunks, fileId } = data;
    
    setActiveTransfers(prev => ({
      ...prev,
      [fileId]: {
        fileName,
        progress: (currentChunk / totalChunks) * 100,
        isReceiving: true
      }
    }));

    setFileChunks(prevChunks => {
      const newChunks = { ...prevChunks };
      
      if (!newChunks[fileId]) {
        newChunks[fileId] = {
          chunks: new Array(totalChunks),
          processedChunks: new Set(),
          fileName
        };
      }
      
      if (newChunks[fileId].processedChunks.has(currentChunk)) {
        return prevChunks;
      }

      newChunks[fileId].chunks[currentChunk] = fileData;
      newChunks[fileId].processedChunks.add(currentChunk);
      
      if (newChunks[fileId].processedChunks.size === totalChunks) {
        // 文件接收完成
        const completeFile = new Blob(newChunks[fileId].chunks);
        const url = URL.createObjectURL(completeFile);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);

        // 清理状态
        delete newChunks[fileId];
        setActiveTransfers(prev => {
          const newTransfers = { ...prev };
          delete newTransfers[fileId];
          return newTransfers;
        });
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

  const handleFileSelect = async (files) => {
    if (!selectedDevice || !peerInstance) return;

    try {
      const conn = peerInstance.connect(selectedDevice.peerId, {
        reliable: true
      });

      conn.on('open', () => {
        files.forEach(file => {
          const fileId = `${file.name}_${Date.now()}`;
          const chunkSize = calculateChunkSize(file.size);
          const chunks = Math.ceil(file.size / chunkSize);
          let currentChunk = 0;

          // 添加到活跃传输列表
          setActiveTransfers(prev => ({
            ...prev,
            [fileId]: {
              fileName: file.name,
              progress: 0,
              isReceiving: false
            }
          }));

          const reader = new FileReader();
          
          reader.onerror = (error) => {
            console.error('文件读取错误:', error);
            // 从活跃传输列表中移除
            setActiveTransfers(prev => {
              const newTransfers = { ...prev };
              delete newTransfers[fileId];
              return newTransfers;
            });
          };

          reader.onload = (e) => {
            try {
              conn.send({
                fileId,
                fileName: file.name,
                data: e.target.result,
                currentChunk,
                totalChunks: chunks
              });
              
              currentChunk++;
              
              // 更新进度
              setActiveTransfers(prev => ({
                ...prev,
                [fileId]: {
                  ...prev[fileId],
                  progress: (currentChunk / chunks) * 100
                }
              }));

              if (currentChunk < chunks) {
                const nextSlice = file.slice(
                  currentChunk * chunkSize,
                  (currentChunk + 1) * chunkSize
                );
                reader.readAsArrayBuffer(nextSlice);
              } else {
                // 传输完成，从列表中移除
                setTimeout(() => {
                  setActiveTransfers(prev => {
                    const newTransfers = { ...prev };
                    delete newTransfers[fileId];
                    return newTransfers;
                  });
                }, 1000);
              }
            } catch (error) {
              console.error('发送文件数据错误:', error);
            }
          };

          const firstSlice = file.slice(0, chunkSize);
          reader.readAsArrayBuffer(firstSlice);
        });
      });
    } catch (error) {
      console.error('创建peer连接失败:', error);
      setError('连接失败，请重试');
    }
  };

  const calculateChunkSize = (fileSize) => {
    if (fileSize > 1024 * 1024 * 100) { // 100MB
      return 1024 * 1024; // 1MB chunks
    }
    return 16384; // 默认16KB
  };

  const resumeFileTransfer = (fileName, startChunk) => {
    // 实现断点续传逻辑
  };

  const verifyFileIntegrity = (file, chunks) => {
    // 实现文件校验逻辑
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
          selectedDevice={selectedDevice}
          activeTransfers={activeTransfers}
        />
        {error && (
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}
      </Box>
    </Container>
  );
}

export default App; 