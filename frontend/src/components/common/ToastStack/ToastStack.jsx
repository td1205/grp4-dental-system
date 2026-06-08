import Toast from '../Toast/Toast'
import './ToastStack.css'

export default function ToastStack({ toasts }) {
  if (!toasts.length) return null

  const visibleToasts = toasts.slice(-3)

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      <div
        className="toast-stack__list"
        style={{ minHeight: `${52 + Math.max(0, visibleToasts.length - 1) * 10}px` }}
      >
        {visibleToasts.map((toast) => (
          <div key={toast.id} className="toast-stack__item">
            <Toast message={toast.message} type={toast.type} />
          </div>
        ))}
      </div>
    </div>
  )
}
