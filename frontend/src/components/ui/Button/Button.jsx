import React from 'react';
import './Button.css';

export function Button({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  className = '', 
  onClick, 
  ...props 
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn--${variant} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
