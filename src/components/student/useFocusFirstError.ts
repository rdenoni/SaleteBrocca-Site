"use client";

import { useEffect } from "react";
import type { AuthFormState } from "@/lib/auth-form-state";

type FieldName = keyof NonNullable<AuthFormState["fieldErrors"]>;

/* Depois de um envio com erro de campo, leva o foco ao primeiro campo inválido (na ordem de `order`). */
export function useFocusFirstError(
  state: AuthFormState,
  fieldIds: Readonly<Record<FieldName, string>>,
  order: readonly FieldName[],
): void {
  useEffect(() => {
    const first = order.find((name) => state.fieldErrors?.[name]);
    if (first) document.getElementById(fieldIds[first])?.focus();
    // O estado é um objeto novo a cada resposta do servidor; ids e ordem são constantes do chamador.
  }, [state]);
}
