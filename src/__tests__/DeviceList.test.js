import { render, screen, fireEvent } from '@testing-library/react';
import DeviceList from '../components/DeviceList';

describe('DeviceList组件测试', () => {
  const devices = [
    { id: '1', name: 'PC Device 1' },
    { id: '2', name: 'Mobile Device 2' }
  ];
  const mockOnDeviceSelect = jest.fn();

  beforeEach(() => {
    mockOnDeviceSelect.mockClear();
  });

  test('应该渲染设备列表', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    expect(screen.getByText('PC Device 1')).toBeInTheDocument();
    expect(screen.getByText('Mobile Device 2')).toBeInTheDocument();
  });

  test('空设备列表时应显示提示信息', () => {
    render(
      <DeviceList 
        devices={[]}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    expect(screen.getByTestId('empty-device-list')).toHaveTextContent('暂无在线设备');
  });

  test('设备类型图标应正确显示', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    expect(screen.getByTestId(`pc-device-icon-${devices[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`mobile-device-icon-${devices[1].id}`)).toBeInTheDocument();
  });

  test('选中的设备应该高亮显示', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={devices[0]}
      />
    );
    const selectedItem = screen.getByTestId(`device-item-${devices[0].id}`);
    expect(selectedItem).toHaveClass('Mui-selected');
  });

  test('点击设备时应该调用回调函数', () => {
    render(
      <DeviceList 
        devices={devices}
        onDeviceSelect={mockOnDeviceSelect}
        selectedDevice={null}
      />
    );
    fireEvent.click(screen.getByText('PC Device 1'));
    expect(mockOnDeviceSelect).toHaveBeenCalledWith(devices[0]);
  });
}); 