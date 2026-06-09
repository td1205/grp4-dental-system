import React from 'react';
import { X } from 'lucide-react';
import './ModalWrapper.css';

/**
 * Modal Wrapper (Enterprise Standard)
 * Thay thế các modal thô kệch ở các trang. Bỏ hiệu ứng blur gắt.
 */
export function ModalWrapper({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  maxWidth = '500px' 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-wrapper-overlay">
      <div className="modal-wrapper-content" style={{ maxWidth }}>
        {title && (
          <header className="modal-wrapper-header">
            <h2 className="modal-wrapper-title">{title}</h2>
            <button type="button" className="modal-wrapper-close" onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </button>
          </header>
        )}
        
        <div className="modal-wrapper-body">
          {children}
        </div>

        {footer && (
          <footer className="modal-wrapper-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
