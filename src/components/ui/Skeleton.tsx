import type { CSSProperties } from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "rect" | "pill" | "card" | "circle";
  className?: string;
}

export function Skeleton({ width = "100%", height = 16, variant = "rect", className }: SkeletonProps) {
  const style: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };
  const variantClass = variant !== "rect" ? styles[variant] : "";
  return (
    <span
      aria-hidden="true"
      className={[styles.skeleton, variantClass, className ?? ""].filter(Boolean).join(" ")}
      style={style}
    />
  );
}
