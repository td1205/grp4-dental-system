import { Icon } from '../Icon/Icon'
import './Modal.css'

export function Modal({
  isOpen,
  title,
  subtitle,
  children,
  footer,
  onClose,
}) {
  if (!isOpen) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button
        type="button"
        className="modal__overlay"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="modal__container">
        <header className="modal__header">
          <div className="modal__title-group">
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Đóng">
            <Icon name="x" size={20} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
