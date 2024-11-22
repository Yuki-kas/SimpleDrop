import React, { useRef } from 'react';
import { 
  Button, 
  Paper, 
  Typography, 
  LinearProgress,
  Box,
  Stack
} from '@mui/material';

const FileTransfer = ({ 
  onFileSelect, 
  transferProgress, 
  selectedDevice,
  isReceiving = false,
  currentFileName = ''
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" gutterBottom>
          文件传输
        </Typography>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => onFileSelect(e.target.files[0])}
        />
        <Button
          variant="contained"
          onClick={handleFileClick}
          disabled={!selectedDevice || transferProgress > 0}
          sx={{ 
            backgroundColor: isReceiving ? '#f50057' : '#2196f3',
            '&:hover': {
              backgroundColor: isReceiving ? '#c51162' : '#1976d2'
            }
          }}
        >
          {transferProgress > 0 ? '传输中...' : '选择文件发送'}
        </Button>

        {transferProgress > 0 && (
          <Box sx={{ width: '100%' }}>
            <Stack spacing={1}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <span style={{ 
                  color: isReceiving ? '#f50057' : '#2196f3',
                  fontWeight: 'bold'
                }}>
                  {isReceiving ? '↓' : '↑'}
                </span>
                <span>
                  {isReceiving ? '正在接收:' : '正在发送:'} {currentFileName}
                </span>
              </Typography>

              <LinearProgress 
                variant="determinate" 
                value={transferProgress} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isReceiving ? 'rgba(245, 0, 87, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: isReceiving ? '#f50057' : '#2196f3'
                  }
                }}
              />

              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="center"
                sx={{ 
                  minWidth: '40px',
                  color: isReceiving ? '#f50057' : '#2196f3',
                  fontWeight: 'bold'
                }}
              >
                {Math.round(transferProgress)}%
              </Typography>
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default FileTransfer; 