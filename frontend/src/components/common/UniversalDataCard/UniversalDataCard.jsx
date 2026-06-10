import './UniversalDataCard.css';

/**
 * Universal Data Card
 * Khuôn mẫu chung cho hiển thị dữ liệu dạng thẻ trên toàn hệ thống
 *
 * @param {Object} props
 * @param {string} props.avatarText Ký tự viết tắt cho avatar (VD: 'JD')
 * @param {string} props.title Tiêu đề chính (VD: Tên nhân viên/khách hàng)
 * @param {string} props.subtitle Tiêu đề phụ (VD: Mã ID)
 * @param {React.ReactNode} props.badge Component Badge trạng thái/chức vụ
 * @param {Array<{label: string, value: string|React.ReactNode}>} props.infoLines Các dòng thông tin Text phụ
 * @param {React.ReactNode} props.actions Các nút hành động nằm bên phải ở footer
 */
export function UniversalDataCard({
  avatarText,
  title,
  subtitle,
  badge,
  infoLines = [],
  actions
}) {
  return (
    <article className="universal-card">
      <header className="universal-card__header">
        <div className="universal-card__avatar" aria-hidden="true">
          {avatarText}
        </div>
        <div className="universal-card__identity">
          <h3 className="universal-card__title" title={title}>{title}</h3>
          <div className="universal-card__subtitle-row">
            {subtitle && <span className="universal-card__subtitle">{subtitle}</span>}
            {badge && <div className="universal-card__badge-wrapper">{badge}</div>}
          </div>
        </div>
      </header>

      {infoLines?.length > 0 && (
        <div className="universal-card__body">
          {infoLines.map((info, idx) => (
            <div key={idx} className="universal-card__info-row">
              <span className="universal-card__label">{info.label}</span>
              <span className="universal-card__value">{info.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <footer className="universal-card__footer">
          {actions}
        </footer>
      )}
    </article>
  );
}
