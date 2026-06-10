import React from 'react';
import { Button } from './Button';

/**
 * Nút bấm thao tác chính (Enterprise Standard)
 * Kế thừa Button component nhưng ép kiểu variant='primary'
 */
export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <Button variant="primary" className={`primary-btn ${className}`.trim()} {...props}>
      {children}
    </Button>
  );
}
