import React, { useRef } from 'react';
import { 
  Button, 
  Paper, 
  Typography, 
  LinearProgress,
  Box,
  Stack,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const FileTransfer = ({ 
  onFileSelect, 
  transferProgress, 
  selectedDevice,
  isReceiving = false,
  currentFileName = '',
  activeTransfers = {}
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (files) => {
    const maxSize = 1024 * 1024 * 500; // 500MB
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        alert(`文件 ${file.name} 大小超过500MB，已跳过`);
        return false;
      }
      return true;
    });
    onFileSelect(validFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ p: 2 }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stack spacing={2}>
        <Typography variant="h6" gutterBottom>
          文件传输
        </Typography>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
          multiple
        />
        <Button
          variant="contained"
          onClick={handleFileClick}
          disabled={!selectedDevice}
          sx={{ 
            backgroundColor: '#2196f3',
            '&:hover': {
              backgroundColor: '#1976d2'
            }
          }}
        >
          选择文件发送
        </Button>

        {Object.keys(activeTransfers).length > 0 && (
          <List>
            {Object.entries(activeTransfers).map(([fileId, transfer]) => (
              <ListItem key={fileId}>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <span style={{ 
                      color: transfer.isReceiving ? '#f50057' : '#2196f3',
                      fontWeight: 'bold'
                    }}>
                      {transfer.isReceiving ? '↓' : '↑'}
                    </span>
                    <span>
                      {transfer.fileName} ({Math.round(transfer.progress)}%)
                    </span>
                  </Typography>

                  <LinearProgress 
                    variant="determinate" 
                    value={transfer.progress} 
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: transfer.isReceiving ? 
                        'rgba(245, 0, 87, 0.1)' : 
                        'rgba(33, 150, 243, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        backgroundColor: transfer.isReceiving ? 
                          '#f50057' : 
                          '#2196f3'
                      }
                    }}
                  />
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Stack>
    </Paper>
  );
};

export default FileTransfer; 