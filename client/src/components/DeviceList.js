import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

const DeviceList = ({ devices, onDeviceSelect, selectedDevice }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        在线设备
      </Typography>
      <List>
        {devices.map((device) => (
          <ListItem
            button
            key={device.socketId}
            selected={selectedDevice?.socketId === device.socketId}
            onClick={() => onDeviceSelect(device)}
          >
            <ListItemText 
              primary={device.deviceName}
              secondary={`${device.deviceType} - ${device.socketId}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DeviceList; 