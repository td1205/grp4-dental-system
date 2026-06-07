import { useEffect } from 'react'
import Icon from '../Icon/Icon'
import './Toast.css'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (message && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const iconName = type === 'error' ? 'alert-circle' : 'check';
  const toastClass = `toast toast--${type}`;

  return (
    <div className={toastClass} role="status">
      <span className="toast__icon-wrap">
        <Icon name={iconName} size={14} strokeWidth={2.5} />
      </span>
      <p className="toast__message">{message}</p>
      {onClose && (
        <button type="button" className="toast__close" onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  )
}
