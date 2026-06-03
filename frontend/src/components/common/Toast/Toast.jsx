import Icon from '../Icon/Icon'
import './Toast.css'

export default function Toast({ message }) {
  return (
    <div className="toast" role="status">
      <span className="toast__icon-wrap">
        <Icon name="check" size={14} strokeWidth={2.5} />
      </span>
      <p className="toast__message">{message}</p>
    </div>
  )
}
