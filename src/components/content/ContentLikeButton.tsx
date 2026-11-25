"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./ContentLikeButton.module.css";

export type LikeContentType = "article" | "podcast";

interface ContentLikeButtonProps {
  type: LikeContentType;
  slug: string;
  title: string;
}

const STORAGE_KEY = "salete_content_likes_v1";

function readStoredLikes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeStoredLike(itemKey: string, liked: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const map = readStoredLikes();
    if (liked) {
      map[itemKey] = true;
    } else {
      delete map[itemKey];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* Ignora em modo privado sem permissão de storage. */
  }
}

export function ContentLikeButton({ type, slug, title }: ContentLikeButtonProps) {
  const t = useMotionTokens();
  const itemKey = `${type}:${slug}`;
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const stored = readStoredLikes();
    setLiked(Boolean(stored[itemKey]));

    fetch(`/api/content/likes?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (!active || !data || typeof data.count !== "number") return;
        setCount(data.count);
      })
      .catch(() => {
        if (active) setCount((prev) => prev ?? 0);
      });

    return () => {
      active = false;
    };
  }, [itemKey, slug, type]);

  async function handleToggle() {
    if (pending) return;
    const nextLiked = !liked;
    const previousCount = count ?? 0;
    const optimisticCount = nextLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

    setLiked(nextLiked);
    setCount(optimisticCount);
    setPending(true);
    writeStoredLike(itemKey, nextLiked);
    setAnnouncement(
      nextLiked
        ? type === "article"
          ? "Você curtiu este artigo."
          : "Você curtiu este episódio."
        : "Curtida removida.",
    );

    try {
      const response = await fetch("/api/content/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          slug,
          action: nextLiked ? "like" : "unlike",
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as { count?: number };
        if (mountedRef.current && typeof data.count === "number") {
          setCount(data.count);
        }
      } else if (mountedRef.current) {
        setLiked(!nextLiked);
        setCount(previousCount);
        writeStoredLike(itemKey, !nextLiked);
      }
    } catch {
      if (mountedRef.current) {
        setLiked(!nextLiked);
        setCount(previousCount);
        writeStoredLike(itemKey, !nextLiked);
      }
    } finally {
      if (mountedRef.current) {
        setPending(false);
      }
    }
  }

  const prompt = type === "article" ? "Este artigo foi útil para você?" : "Gostou deste episódio?";
  const noun = type === "article" ? "artigo" : "episódio";
  const countLabel =
    count === null ? "" : count === 1 ? "1 curtida" : `${count} curtidas`;

  return (
    <div className={styles.bar} data-content-like={itemKey}>
      <p className={styles.prompt}>{prompt}</p>
      <div className={styles.actions}>
        <motion.button
          type="button"
          className={`${styles.button} ${liked ? styles.liked : ""}`}
          aria-pressed={liked}
          aria-label={liked ? `Remover curtida do ${noun} ${title}` : `Curtir o ${noun} ${title}`}
          disabled={pending}
          onClick={handleToggle}
          whileTap={t.reduced ? undefined : { scale: 0.95 }}
          transition={t.reduced ? { duration: 0 } : t.spring.press}
        >
          <motion.span
            className={styles.icon}
            aria-hidden="true"
            animate={
              t.reduced
                ? { scale: 1 }
                : liked
                  ? { scale: [1, 1.32, 1] }
                  : { scale: 1 }
            }
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} strokeWidth={2.2} />
          </motion.span>
          <span className={styles.label}>{liked ? "Curtido" : "Curtir"}</span>
          {count !== null && (
            <span className={styles.count} data-like-count="">
              {count}
            </span>
          )}
        </motion.button>
        {count !== null && count > 0 && (
          <span className={styles.summary} aria-hidden="true">
            {countLabel}
          </span>
        )}
      </div>
      <span className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
