import { render, screen, fireEvent } from '@testing-library/react';
import FileTransfer from '../components/FileTransfer';

describe('FileTransfer组件测试', () => {
  const defaultProps = {
    onFileSelect: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    defaultProps.onFileSelect.mockClear();
  });

  test('应该渲染文件选择按钮', () => {
    render(<FileTransfer {...defaultProps} />);
    expect(screen.getByText('选择文件发送')).toBeInTheDocument();
  });

  test('文件大小超限时应显示警告', () => {
    render(<FileTransfer {...defaultProps} />);
    
    const input = screen.getByTestId('file-input');
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 600 * 1024 * 1024 }); // 600MB
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText('文件大小超过500MB限制')).toBeInTheDocument();
  });

  test('选择有效文件时应调用回调函数', () => {
    render(<FileTransfer {...defaultProps} />);
    
    const input = screen.getByTestId('file-input');
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith([file]);
  });
}); 