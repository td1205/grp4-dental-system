/**
 * Controlled form field — label, control, validation message.
 * Pure presentational; state lives in the parent or useStaffForm.
 */
export function FormField({
  id,
  label,
  required = false,
  type = 'text',
  as = 'input',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  options = [],
  rows = 3,
  name,
  autoComplete,
}) {
  const errorId = error ? `${id}-error` : undefined;
  const inputClassName = `staff-form-field__input${
    error ? ' staff-form-field__input--invalid' : ''
  }`;

  const controlProps = {
    id,
    name: name ?? id,
    value,
    onChange,
    onBlur,
    disabled,
    placeholder,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': errorId,
    className: inputClassName,
    autoComplete,
  };

  let control;
  if (as === 'select') {
    control = (
      <select {...controlProps}>
        {options?.map((opt) => (
          <option key={opt.value || '__empty'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea {...controlProps} rows={rows} />;
  } else {
    control = <input {...controlProps} type={type} />;
  }

  return (
    <div className={`staff-form-field${error ? ' staff-form-field--error' : ''}`}>
      <label className="staff-form-field__label" htmlFor={id}>
        {label.toLowerCase()}
        {required && (
          <span className="staff-form-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {control}
      {error ? (
        <p id={errorId} className="staff-form-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
