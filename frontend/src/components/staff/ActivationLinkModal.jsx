import React from 'react';
import { Icon } from '../common/Icon/Icon';
import './ActivationLinkModal.css';

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

export function ActivationLinkModal({ isOpen, staff, onClose, onCopySuccess }) {
  if (!isOpen || !staff) return null;

  const activationUrl = `http://localhost:5174/first-time-password?token=${staff.activationToken}&email=${staff.personalEmail || staff.email}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activationUrl)
      .then(() => {
        onCopySuccess?.();
      })
      .catch((err) => {
        console.error('Không thể sao chép liên kết:', err);
      });
  };

  return (
    <div className="activation-modal-overlay">
      <div className="activation-modal" role="dialog" aria-modal="true">
        <header className="activation-modal__header">
          <h3>Mã kích hoạt & Liên kết Demo</h3>
          <button type="button" className="activation-modal__close-btn" onClick={onClose} aria-label="Đóng">
            <Icon name="x" size={20} />
          </button>
        </header>

        <div className="activation-modal__body">
          <p className="activation-modal__desc">
            Dưới đây là đường dẫn kích hoạt tài khoản dành cho <strong>{staff.fullName}</strong>.
            Bạn có thể sao chép và dán vào tab ẩn danh khác để thực hiện thiết lập mật khẩu lần đầu:
          </p>

          <div className="activation-modal__link-box">
            <textarea
              className="activation-modal__link-text"
              readOnly
              value={activationUrl}
              onClick={(e) => e.target.select()}
            />
          </div>
        </div>

        <footer className="activation-modal__footer">
          <button type="button" className="activation-modal__btn-close" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="activation-modal__btn-copy" onClick={handleCopy}>
            <CopyIcon />
            Sao chép liên kết
          </button>
        </footer>
      </div>
    </div>
  );
}
