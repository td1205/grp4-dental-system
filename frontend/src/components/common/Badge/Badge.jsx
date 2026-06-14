import './Badge.css'

const VARIANT_CLASS = {
  success: 'badge--success',
  warning: 'badge--warning',
  error: 'badge--error',
  primary: 'badge--primary',
  implant: 'badge--specialty-implant',
  orthodontics: 'badge--specialty-orthodontics',
  reception: 'badge--specialty-reception',
}

export function Badge({ label, variant = 'success', className = '' }) {
  const modifier = VARIANT_CLASS[variant] ?? VARIANT_CLASS.success

  return (
    <span className={`badge ${modifier} ${className}`.trim()}>{label}</span>
  )
}
