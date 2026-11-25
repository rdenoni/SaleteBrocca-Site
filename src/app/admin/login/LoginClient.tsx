"use client";

import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { adminLoginAction, type AdminLoginState } from "./actions";
import styles from "./login.module.css";

const INITIAL: AdminLoginState = { status: "idle", message: "" };

export function AdminLoginClient({ nextPath, demoMode }: { nextPath: string; demoMode: boolean }) {
  const [state, action, pending] = useActionState(adminLoginAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Image
            src="/brand/logo/logo-lateral-cor.png"
            alt="Salete Brocca"
            width={180}
            height={56}
            className={styles.logo}
            priority
          />
          <span className={styles.badge}>
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Acesso Administrativo</span>
          </span>
        </div>

        <h1 className={styles.title}>Entrar no Painel Admin</h1>
        <p className={styles.subtitle}>
          Área restrita à administração do site. Use seu e-mail e senha de administrador.
        </p>

        {demoMode ? (
          <p className={styles.demoNote} role="status">
            Modo demonstração ativo (sem variáveis do Supabase neste ambiente). Envie qualquer e-mail e senha para
            visualizar o painel.
          </p>
        ) : null}

        <form action={action} className={styles.form}>
          <input type="hidden" name="next" value={nextPath} />

          <label className={styles.field}>
            <span className={styles.label}>E-mail</span>
            <input
              className={styles.input}
              type="email"
              name="email"
              autoComplete="username"
              placeholder="seu@email.com"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Senha</span>
            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </label>

          {state.status === "error" ? (
            <p role="alert" className={styles.error}>
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={pending}
            aria-busy={pending}
            data-loading={pending ? "true" : undefined}
          >
            {pending ? <Spinner size={16} /> : <Lock size={16} aria-hidden="true" />}
            <span>{pending ? "Verificando..." : "Entrar no painel"}</span>
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Voltar para o site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
