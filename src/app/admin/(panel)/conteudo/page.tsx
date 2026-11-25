import { requireAdmin } from "@/lib/admin/auth";
import { getAdminArticleCategories, getAdminArticles, getAdminPodcasts } from "@/lib/admin/content-cms";
import { ContentCmsClient } from "./ContentCmsClient";

export default async function AdminContentPage() {
  await requireAdmin("/admin/conteudo");
  const [articles, podcasts] = await Promise.all([getAdminArticles(), getAdminPodcasts()]);

  return <ContentCmsClient articles={articles} podcasts={podcasts} categories={getAdminArticleCategories()} />;
}
