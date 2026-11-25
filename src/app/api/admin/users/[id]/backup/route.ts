import { NextResponse } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin("/admin/usuarios");
  const { id } = await context.params;

  if (session.mode !== "live") {
    return NextResponse.json(
      { error: "Exportação disponível apenas com Supabase conectado." },
      { status: 503 },
    );
  }

  const admin = createSupabaseAdminClient();
  const [profile, roles, enrollments, progress, notes] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.from("user_roles").select("*").eq("user_id", id),
    admin.from("enrollments").select("*").eq("user_id", id),
    admin.from("lesson_progress").select("*").eq("user_id", id),
    admin.from("lesson_notes").select("*").eq("user_id", id),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: session.email,
    userId: id,
    profile: profile.data ?? null,
    roles: roles.data ?? [],
    enrollments: enrollments.data ?? [],
    lessonProgress: progress.data ?? [],
    lessonNotes: notes.data ?? [],
  };

  await logAdminAction({
    session,
    action: "user.export_backup",
    targetType: "profiles",
    targetId: id,
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-usuario-${id.slice(0, 8)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
