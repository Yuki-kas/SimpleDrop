import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import FileTransfer from '../components/FileTransfer';

describe('FileTransfer组件测试', () => {
  const mockOnFileSelect = jest.fn();
  const defaultProps = {
    onFileSelect: mockOnFileSelect,
    selectedDevice: null,
    activeTransfers: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该渲染文件选择按钮', () => {
    render(<FileTransfer {...defaultProps} />);
    expect(screen.getByText('选择文件发送')).toBeInTheDocument();
  });

  test('没有选择设备时按钮应该禁用', () => {
    render(<FileTransfer {...defaultProps} />);
    expect(screen.getByText('选择文件发送')).toBeDisabled();
  });

  test('选择设备后按钮应该启用', () => {
    const props = {
      ...defaultProps,
      selectedDevice: { id: '1', name: 'Test Device' }
    };
    render(<FileTransfer {...props} />);
    expect(screen.getByText('选择文件发送')).not.toBeDisabled();
  });

  test('应该显示活跃传输列表', () => {
    const props = {
      ...defaultProps,
      activeTransfers: {
        'file1': {
          fileName: 'test.txt',
          progress: 50,
          isReceiving: false
        }
      }
    };
    render(<FileTransfer {...props} />);
    expect(screen.getByText('test.txt (50%)')).toBeInTheDocument();
  });

  test('文件大小超限时应显示警告', () => {
    const file = new File([''], 'test.txt', { size: 600 * 1024 * 1024 });
    render(<FileTransfer {...defaultProps} />);
    
    const input = screen.getByRole('file-input');
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/文件大小超过500MB/)).toBeInTheDocument();
  });

  test('多文件传输列表应正确显示', () => {
    const props = {
      ...defaultProps,
      activeTransfers: {
        'file1': { fileName: 'test1.txt', progress: 50, isReceiving: false },
        'file2': { fileName: 'test2.txt', progress: 30, isReceiving: true }
      }
    };
    render(<FileTransfer {...props} />);
    
    expect(screen.getByText('test1.txt (50%)')).toBeInTheDocument();
    expect(screen.getByText('test2.txt (30%)')).toBeInTheDocument();
  });
}); 