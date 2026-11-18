import "server-only";

import { CONFIRM_PATH, SET_PASSWORD_PATH } from "@/lib/auth-paths";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/site-url";
import type { Json } from "@/types/database";
import { classifyExistingEvent, type ClaimResult, type KiwifyStore } from "./handler";

/* Postgres: violação de unique. */
const UNIQUE_VIOLATION = "23505";
const INVITE_REDIRECT_PATH = `${CONFIRM_PATH}?next=${SET_PASSWORD_PATH}`;

function isExistingUserError(error: { code?: string }): boolean {
  return error.code === "email_exists" || error.code === "user_already_exists";
}

/** Store real da Kiwify (service role: ignora RLS). Chamar dentro da requisição, nunca no escopo do módulo. */
export function createSupabaseKiwifyStore(): KiwifyStore {
  const db = createSupabaseAdminClient();

  return {
    async claimEvent({ orderId, eventType, orderStatus, payload }): Promise<ClaimResult> {
      const { error } = await db.from("kiwify_events").insert({
        order_id: orderId,
        event_type: eventType,
        order_status: orderStatus,
        payload: payload as Json,
      });
      if (!error) return "new";
      if (error.code !== UNIQUE_VIOLATION) throw error;

      const { data: existing, error: readError } = await db
        .from("kiwify_events")
        .select("processed_at, error, received_at")
        .eq("order_id", orderId)
        .eq("event_type", eventType)
        .maybeSingle();
      if (readError) throw readError;
      /* A linha existia há um instante e sumiu: não dá para afirmar que foi processada. */
      if (!existing) return "in_flight";

      const verdict = classifyExistingEvent(
        { processedAt: existing.processed_at, error: existing.error, receivedAt: existing.received_at },
        Date.now(),
      );
      if (verdict !== "retry") return verdict;

      /* Reserva atômica da nova tentativa: só uma requisição concorrente encontra a linha ainda como a leu. */
      const { data: claimed, error: claimError } = await db
        .from("kiwify_events")
        .update({ error: null, received_at: new Date().toISOString() })
        .eq("order_id", orderId)
        .eq("event_type", eventType)
        .eq("received_at", existing.received_at)
        .is("processed_at", null)
        .select("id");
      if (claimError) throw claimError;
      /* Nenhuma linha atualizada: outra requisição reassumiu (ou concluiu) o evento no meio tempo. */
      return claimed && claimed.length > 0 ? "retry" : "in_flight";
    },

    async grantEnrollment({ email, courseSlug, orderId, productId }) {
      const { error } = await db.from("enrollments").upsert(
        {
          email,
          course_slug: courseSlug,
          status: "active",
          source: "kiwify",
          order_id: orderId,
          product_id: productId,
        },
        { onConflict: "source,order_id,course_slug", ignoreDuplicates: true },
      );
      if (error) throw error;
    },

    async revokeEnrollment({ orderId, courseSlug, status, email, productId }) {
      if (courseSlug && email) {
        /* Um único upsert que ATUALIZA o status: a revogação vence uma aprovação concorrente ou atrasada (a aprovação
           usa ignoreDuplicates e nunca desfaz a revogação). Sem linha ainda, registra a matrícula já revogada. */
        const { data, error } = await db
          .from("enrollments")
          .upsert(
            { email, course_slug: courseSlug, status, source: "kiwify", order_id: orderId, product_id: productId },
            { onConflict: "source,order_id,course_slug" },
          )
          .select("id");
        if (error) throw error;
        return data?.length ?? 0;
      }

      /* Sem e-mail ou sem curso no payload: só dá para atualizar o que já existe (todas as matrículas do pedido,
         ou as do curso quando só o e-mail falta). */
      let update = db.from("enrollments").update({ status }).eq("source", "kiwify").eq("order_id", orderId);
      if (courseSlug) update = update.eq("course_slug", courseSlug);
      const { data, error } = await update.select("id");
      if (error) throw error;
      return data?.length ?? 0;
    },

    async inviteStudent(email) {
      const { error } = await db.auth.admin.inviteUserByEmail(email, {
        redirectTo: absoluteUrl(INVITE_REDIRECT_PATH),
      });
      /* Conta já existente: nada a fazer, o gatilho do banco liga a matrícula pelo e-mail. */
      if (error && !isExistingUserError(error)) throw error;
    },

    async markProcessed(orderId, eventType) {
      const { error } = await db
        .from("kiwify_events")
        .update({ processed_at: new Date().toISOString(), error: null })
        .eq("order_id", orderId)
        .eq("event_type", eventType);
      if (error) throw error;
    },

    async markFailed(orderId, eventType, message) {
      const { error } = await db
        .from("kiwify_events")
        .update({ error: message })
        .eq("order_id", orderId)
        .eq("event_type", eventType);
      if (error) throw error;
    },
  };
}
