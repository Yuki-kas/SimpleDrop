import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import DeviceList from '../components/DeviceList';

describe('DeviceList组件测试', () => {
  const mockOnDeviceSelect = jest.fn();
  const devices = [
    { socketId: '1', deviceName: 'Device 1', deviceType: 'PC设备' },
    { socketId: '2', deviceName: 'Device 2', deviceType: '移动设备' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该渲染设备列表', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    expect(screen.getByText('Device 1')).toBeInTheDocument();
    expect(screen.getByText('Device 2')).toBeInTheDocument();
  });

  test('点击设备应该触发选择事件', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    fireEvent.click(screen.getByText('Device 1'));
    expect(mockOnDeviceSelect).toHaveBeenCalledWith(devices[0]);
  });

  test('选中的设备应该高亮显示', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={devices[0]}
      />
    );
    const selectedItem = screen.getByRole('button', { name: /Device 1/i });
    expect(selectedItem).toHaveClass('Mui-selected');
  });

  test('空设备列表时应显示提示信息', () => {
    render(
      <DeviceList 
        devices={[]}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    expect(screen.getByText('暂无在线设备')).toBeInTheDocument();
  });

  test('设备类型图标应正确显示', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    const pcIcon = screen.getByTestId('pc-device-icon-1');
    const mobileIcon = screen.getByTestId('mobile-device-icon-2');
    expect(pcIcon).toBeInTheDocument();
    expect(mobileIcon).toBeInTheDocument();
  });
}); 