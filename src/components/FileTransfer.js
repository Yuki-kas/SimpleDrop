import { Paper, Stack, Typography, Button, Alert } from '@mui/material';
import { useRef, useState } from 'react';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const FileTransfer = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      setError('文件大小超过500MB限制');
      return;
    }
    
    setError('');
    onFileSelect?.(files);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6" gutterBottom>
          文件传输
        </Typography>
        <input
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          ref={fileInputRef}
          data-testid="file-input"
        />
        <Button
          variant="contained"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          选择文件发送
        </Button>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
};

export default FileTransfer; 