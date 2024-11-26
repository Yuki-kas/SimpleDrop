import { List, ListItem, ListItemText, ListItemIcon, Typography, Paper } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

const DeviceList = ({ devices = [], onDeviceSelect, selectedDevice }) => {
  const getDeviceIcon = (device) => {
    const isPc = device.name.includes('PC') || device.name.includes('pc');
    const Icon = isPc ? ComputerIcon : PhoneAndroidIcon;
    return (
      <Icon 
        data-testid={`${isPc ? 'pc' : 'mobile'}-device-icon-${device.id}`}
      />
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        在线设备
      </Typography>
      <List>
        {devices.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="暂无在线设备"
              data-testid="empty-device-list"
            />
          </ListItem>
        ) : (
          devices.map((device) => (
            <ListItem
              button
              key={device.id}
              data-testid={`device-item-${device.id}`}
              selected={selectedDevice?.id === device.id}
              onClick={() => onDeviceSelect(device)}
            >
              <ListItemIcon>
                {getDeviceIcon(device)}
              </ListItemIcon>
              <ListItemText 
                primary={device.name}
                secondary={`${device.name.includes('PC') || device.name.includes('pc') ? 'PC设备' : '移动设备'} - ${device.id}`}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default DeviceList; 