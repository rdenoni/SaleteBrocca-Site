import { requireAdmin } from "@/lib/admin/auth";
import { getAdminSiteLinks } from "@/lib/admin/cms";
import { LinksCmsClient } from "./LinksCmsClient";

export default async function AdminLinksPage() {
  await requireAdmin("/admin/links");
  const links = await getAdminSiteLinks();

  return <LinksCmsClient links={links} />;
}
