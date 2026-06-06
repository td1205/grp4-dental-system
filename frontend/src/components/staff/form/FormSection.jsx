/**
 * Form section card — reuses `.staff-card` from staff-management.css.
 * Wrap fields in `FormSectionRow` for a responsive two-column row.
 */
export function FormSection({ title, children, className = '' }) {
  const rootClass = ['staff-card', 'staff-form-section', className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-labelledby={title ? `section-${slugify(title)}` : undefined}>
      {title ? (
        <h2 id={`section-${slugify(title)}`} className="staff-form-section__title">
          {title}
        </h2>
      ) : null}
      <div className="staff-form-section__body">{children}</div>
    </section>
  );
}

/** Side-by-side fields on wide screens; stacks on small screens. */
export function FormSectionRow({ children, className = '' }) {
  const rowClass = ['staff-form-section__row', className].filter(Boolean).join(' ');
  return <div className={rowClass}>{children}</div>;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
