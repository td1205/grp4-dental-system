import React, { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({ 
  icon, 
  className = '', 
  containerClassName = '', 
  ...props 
}, ref) => {
  return (
    <div className={`ui-input-wrapper ${containerClassName}`}>
      {icon && <span className="ui-input__icon">{icon}</span>}
      <input
        ref={ref}
        className={`ui-input ${icon ? 'ui-input--with-icon' : ''} ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
