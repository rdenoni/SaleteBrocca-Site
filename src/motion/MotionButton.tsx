"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "motion/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./MotionButton.module.css";
import { TransitionLink } from "./transitions/TransitionLink";
import { useMotionTokens } from "./useMotionTokens";

export type MotionButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type MotionButtonSize = "md" | "sm";

interface CommonProps {
  variant?: MotionButtonVariant;
  size?: MotionButtonSize;
  /** Ícone à direita do rótulo. Recua 4px (distance.micro) no hover. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface LinkButtonProps
  extends CommonProps,
    Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "aria-label" | "aria-current" | "target" | "rel" | "onClick" | "id"> {
  href: string;
  prefetch?: boolean;
  /** Opcional: navega pela transição de página (cortina) em vez do Link comum. Padrão: false. */
  withCurtain?: boolean;
}

interface NativeButtonProps extends CommonProps, Omit<HTMLMotionProps<"button">, "children" | "className"> {
  href?: undefined;
}

export type MotionButtonProps = LinkButtonProps | NativeButtonProps;

/* Criados uma vez no módulo: criar dentro do render remontaria o botão a cada atualização. */
const MotionLink = motion.create(Link);
const MotionCurtainLink = motion.create(TransitionLink);

function classNames(variant: MotionButtonVariant, size: MotionButtonSize, extra?: string): string {
  return [styles.button, styles[variant], size === "sm" ? styles.sm : "", extra ?? ""].filter(Boolean).join(" ");
}

/* Botão da marca. O hover varre o preenchimento da esquerda (CSS, scaleX); o toque encolhe a 0,97
   com t.spring.press. Com movimento reduzido: só a cor muda, sem varredura nem deslocamento de ícone.
   Funciona como <button> ou, com href, como link do Next. */
export function MotionButton(props: MotionButtonProps) {
  const t = useMotionTokens();
  const { variant = "primary", size = "md", icon, children, className } = props;

  const content = (
    <>
      <span className={styles.fill} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </>
  );
  const reducedAttr = t.reduced ? "" : undefined;

  if (props.href !== undefined) {
    const { href, prefetch, onClick, target, rel, id, withCurtain = false } = props;
    const LinkTag = withCurtain ? MotionCurtainLink : MotionLink;
    return (
      <LinkTag
        href={href}
        prefetch={prefetch}
        onClick={onClick}
        target={target}
        rel={rel}
        id={id}
        className={classNames(variant, size, className)}
        aria-label={props["aria-label"]}
        aria-current={props["aria-current"]}
        data-reduced={reducedAttr}
        whileTap={t.reduced ? undefined : { scale: 0.97 }}
        transition={t.spring.press}
      >
        {content}
      </LinkTag>
    );
  }

  const {
    variant: _variant,
    size: _size,
    icon: _icon,
    children: _children,
    className: _className,
    href: _href,
    type = "button",
    disabled,
    ...rest
  } = props;

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={classNames(variant, size, className)}
      data-reduced={reducedAttr}
      whileTap={t.reduced || disabled ? undefined : { scale: 0.97 }}
      transition={t.spring.press}
      {...rest}
    >
      {content}
    </motion.button>
  );
}
