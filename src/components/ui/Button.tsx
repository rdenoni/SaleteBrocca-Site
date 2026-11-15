import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "md" | "sm";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Classe aplicada ao rótulo (ex.: esconder visualmente no mobile). */
  labelClassName?: string;
}

interface LinkButtonProps extends CommonProps {
  href: string;
  "aria-label"?: string;
  "aria-current"?: "page";
}

interface NativeButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: undefined;
}

export type ButtonProps = LinkButtonProps | NativeButtonProps;

function classNames(variant: ButtonVariant, size: ButtonSize, extra?: string): string {
  return [styles.button, styles[variant], size === "sm" ? styles.sm : "", extra ?? ""]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", icon, children, className, labelClassName } = props;
  const content = (
    <>
      {icon}
      <span className={labelClassName}>{children}</span>
    </>
  );

  if (props.href !== undefined) {
    return (
      <Link
        href={props.href}
        className={classNames(variant, size, className)}
        aria-label={props["aria-label"]}
        aria-current={props["aria-current"]}
      >
        {content}
      </Link>
    );
  }

  const {
    variant: _variant,
    size: _size,
    icon: _icon,
    children: _children,
    className: _className,
    labelClassName: _labelClassName,
    href: _href,
    type = "button",
    ...rest
  } = props;

  return (
    <button type={type} className={classNames(variant, size, className)} {...rest}>
      {content}
    </button>
  );
}
