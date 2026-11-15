import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";
import styles from "./Field.module.css";

interface FrameProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

interface ControlA11y {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

function controlA11y({ id, hint, error }: FrameProps): ControlA11y {
  const describedBy = [hint ? `${id}-dica` : "", error ? `${id}-erro` : ""].filter(Boolean).join(" ");
  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : undefined,
  };
}

/* Rótulo visível, dica e erro ligados ao controle por aria-describedby. */
function FieldFrame({ id, label, hint, error, children }: FrameProps & { children: ReactNode }) {
  return (
    <div className={styles.field} data-invalid={error ? "" : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-dica`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erro`} className={styles.error} aria-live="polite">
          <CircleAlert aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

type InputFieldProps = FrameProps & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

/* Campo com rótulo visível (padrão para formulários fora da Home). */
export function Field({ id, label, hint, error, ...inputProps }: InputFieldProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <input id={id} className={styles.input} {...controlA11y({ id, label, hint, error })} {...inputProps} />
    </FieldFrame>
  );
}

type TextAreaFieldProps = FrameProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export function TextAreaField({ id, label, hint, error, rows = 5, ...textareaProps }: TextAreaFieldProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        className={`${styles.input} ${styles.textarea}`}
        {...controlA11y({ id, label, hint, error })}
        {...textareaProps}
      />
    </FieldFrame>
  );
}

type SelectFieldProps = FrameProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & { options: readonly string[] };

export function SelectField({ id, label, hint, error, options, ...selectProps }: SelectFieldProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      <select id={id} className={`${styles.input} ${styles.select}`} {...controlA11y({ id, label, hint, error })} {...selectProps}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}
