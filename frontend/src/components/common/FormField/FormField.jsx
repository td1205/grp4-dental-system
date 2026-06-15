import { MacDropdown } from '../MacDropdown/MacDropdown';

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
  children,
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
      <MacDropdown
        options={options}
        value={value}
        onChange={(val) => {
          if (onChange) {
            onChange({ target: { name: name ?? id, value: val } });
          }
        }}
        placeholder={placeholder}
      />
    );
  } else if (as === 'textarea') {
    control = <textarea {...controlProps} rows={rows} />;
  } else {
    control = <input {...controlProps} type={type} />;
  }

  return (
    <div className={`staff-form-field${error ? ' staff-form-field--error' : ''}`}>
      <label className="staff-form-field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="staff-form-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children || control}
      {error ? (
        <p id={errorId} className="staff-form-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
