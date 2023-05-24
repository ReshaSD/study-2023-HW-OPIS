/* eslint-disable react/require-default-props */
import { ReactNode } from 'react';
import { ResizableBox as ReactResizableBox } from 'react-resizable';

import 'react-resizable/css/styles.css';

interface IResizableBox {
  children: ReactNode;
  width?: number;
  height?: number;
  resizable?: boolean;
  className?: string;
}

export default function ResizableBox({
  children,
  width = 800,
  height = 300,
  resizable = true,
  className = '',
}: IResizableBox) {
  return (
    <div style={{ marginLeft: 20 }}>
      <div
        style={{
          display: 'inline-block',
          width: 'auto',
          background: 'white',
          padding: '.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 30px 40px rgba(0,0,0,.1)',
        }}
      >
        {resizable ? (
          <ReactResizableBox width={width} height={height}>
            <div
              style={{
                width: '100%',
                height: '100%',
              }}
              className={className}
            >
              {children}
            </div>
          </ReactResizableBox>
        ) : (
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
            className={className}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
