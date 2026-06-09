import './SummaryCards.css';

export function SummaryCards({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="summary-cards">
      {items?.map((item, index) => (
        <div key={index} className="summary-card">
          <div className="summary-card__content">
            <h3 className="summary-card__title">{item.title}</h3>
            <div className="summary-card__value" style={{ color: item.color || 'var(--color-text-main)' }}>
              {item.value}
            </div>
          </div>
          {item.icon && (
            <div className="summary-card__icon" style={{ color: item.color || 'var(--color-cta)' }}>
              {item.icon}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
