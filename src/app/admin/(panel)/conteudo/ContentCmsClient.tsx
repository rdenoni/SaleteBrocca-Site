"use client";

import { FileText, Headphones, Plus, Save, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import type { AdminArticleItem, AdminPodcastItem } from "@/lib/admin/content-cms";
import type { ArticleCategory } from "@/types/content";
import { deleteArticleAction, deletePodcastAction, saveArticleAction, savePodcastAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

function ArticleForm({
  article,
  categories,
  isNew,
}: {
  article?: AdminArticleItem;
  categories: readonly ArticleCategory[];
  isNew?: boolean;
}) {
  const [state, action, pending] = useActionState(saveArticleAction, INITIAL_STATE);

  return (
    <form action={action} className={styles.form}>
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Título do artigo *</span>
          <input className={styles.input} name="title" required defaultValue={article?.title ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Slug (URL)</span>
          <input className={styles.input} name="slug" placeholder="gerado automaticamente" defaultValue={article?.slug ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Categoria</span>
          <select className={styles.select} name="categorySlug" defaultValue={article?.categorySlug ?? "aprendizagem"}>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Status</span>
          <select className={styles.select} name="status" defaultValue={article?.status ?? "published"}>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
          </select>
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Resumo (excerpt)</span>
          <textarea className={styles.textarea} name="excerpt" defaultValue={article?.excerpt ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>URL da capa</span>
          <input className={styles.input} name="coverUrl" defaultValue={article?.coverUrl ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ou enviar imagem de capa</span>
          <input className={styles.input} type="file" name="coverFile" accept="image/*" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Descrição acessível (alt da imagem)</span>
          <input className={styles.input} name="coverAlt" defaultValue={article?.coverAlt ?? ""} />
        </label>
        <label className={styles.checkboxRow}>
          <input type="checkbox" name="featured" defaultChecked={article?.featured ?? false} />
          <span>Destacar na Home</span>
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Conteúdo do artigo (Markdown: ## subtítulo, - listas)</span>
          <textarea className={styles.textarea} style={{ minHeight: 160 }} name="bodyMarkdown" defaultValue={article?.bodyMarkdown ?? ""} />
        </label>
      </div>

      {state.status !== "idle" ? (
        <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
          {state.message}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryBtn} disabled={pending}>
          <Save size={16} aria-hidden="true" />
          <span>{pending ? "Salvando..." : isNew ? "Publicar artigo" : "Salvar artigo"}</span>
        </button>
      </div>
    </form>
  );
}

function PodcastForm({ podcast, isNew }: { podcast?: AdminPodcastItem; isNew?: boolean }) {
  const [state, action, pending] = useActionState(savePodcastAction, INITIAL_STATE);

  return (
    <form action={action} className={styles.form}>
      {podcast ? <input type="hidden" name="id" value={podcast.id} /> : null}
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Número do episódio *</span>
          <input className={styles.input} type="number" min={1} name="episodeNumber" defaultValue={podcast?.episodeNumber ?? 5} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Status</span>
          <select className={styles.select} name="status" defaultValue={podcast?.status ?? "published"}>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Título do episódio *</span>
          <input className={styles.input} name="title" required defaultValue={podcast?.title ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Slug (URL)</span>
          <input className={styles.input} name="slug" defaultValue={podcast?.slug ?? ""} />
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Resumo do episódio</span>
          <textarea className={styles.textarea} name="summary" defaultValue={podcast?.summary ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>URL do áudio (.m4a ou .mp3)</span>
          <input className={styles.input} name="audioUrl" defaultValue={podcast?.audioUrl ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ou enviar arquivo de áudio (até 20 MB)</span>
          <input className={styles.input} type="file" name="audioFile" accept="audio/mp4,audio/mpeg,audio/x-m4a,.m4a,.mp3" />
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Temas abordados (um por linha)</span>
          <textarea className={styles.textarea} name="topics" defaultValue={podcast?.topics.join("\n") ?? ""} />
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Códigos de aulas relacionadas (separados por vírgula)</span>
          <input
            className={styles.input}
            name="lessonCodes"
            placeholder="M02_A04, M02_A05"
            defaultValue={podcast?.lessonCodes.join(", ") ?? ""}
          />
        </label>
      </div>

      {state.status !== "idle" ? (
        <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
          {state.message}
        </p>
      ) : null}

      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryBtn} disabled={pending}>
          <Save size={16} aria-hidden="true" />
          <span>{pending ? "Salvando..." : isNew ? "Adicionar episódio" : "Salvar episódio"}</span>
        </button>
      </div>
    </form>
  );
}

export function ContentCmsClient({
  articles,
  podcasts,
  categories,
}: {
  articles: readonly AdminArticleItem[];
  podcasts: readonly AdminPodcastItem[];
  categories: readonly ArticleCategory[];
}) {
  const [tab, setTab] = useState<"articles" | "podcasts">("articles");
  const [addingArticle, setAddingArticle] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [addingPodcast, setAddingPodcast] = useState(false);
  const [editingPodcastId, setEditingPodcastId] = useState<string | null>(null);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Artigos & Podcasts</h1>
        <p className={styles.subtitle}>
          Adicione e edite artigos do portal e episódios do Podcast Aprender com a Salete com upload de capas e áudios.
        </p>
        <div className={styles.tabs} role="tablist" aria-label="Tipos de conteúdo">
          <button
            type="button"
            role="tab"
            className={styles.tabBtn}
            aria-selected={tab === "articles"}
            onClick={() => setTab("articles")}
          >
            <FileText size={17} aria-hidden="true" />
            <span>Artigos ({articles.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            className={styles.tabBtn}
            aria-selected={tab === "podcasts"}
            onClick={() => setTab("podcasts")}
          >
            <Headphones size={17} aria-hidden="true" />
            <span>Podcasts ({podcasts.length})</span>
          </button>
        </div>
      </header>

      {tab === "articles" ? (
        <section className={styles.panel} aria-label="Gerenciar artigos">
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Artigos</h2>
            <button type="button" className={styles.primaryBtn} onClick={() => setAddingArticle((v) => !v)}>
              <Plus size={16} aria-hidden="true" />
              <span>{addingArticle ? "Fechar formulário" : "Novo artigo"}</span>
            </button>
          </div>

          {addingArticle ? (
            <div className={styles.itemCard}>
              <h3 className={styles.itemTitle}>Adicionar novo artigo</h3>
              <ArticleForm categories={categories} isNew />
            </div>
          ) : null}

          <div className={styles.itemList}>
            {articles.map((article) => (
              <article key={article.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.thumb}>
                    {article.coverUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={article.coverUrl} alt="" />
                    ) : (
                      "Artigo"
                    )}
                  </div>
                  <div className={styles.itemMeta}>
                    <h3 className={styles.itemTitle}>{article.title}</h3>
                    <p className={styles.itemDesc}>{article.excerpt}</p>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.pill} ${article.status === "published" ? styles.pillActive : ""}`}>
                        {article.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                      <span className={styles.pill}>{article.categorySlug}</span>
                      {article.featured ? <span className={styles.pill}>Destaque Home</span> : null}
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setEditingArticleId((cur) => (cur === article.id ? null : article.id))}
                    >
                      {editingArticleId === article.id ? "Fechar" : "Editar"}
                    </button>
                    {!article.fromFallback ? (
                      <form action={deleteArticleAction}>
                        <input type="hidden" name="id" value={article.id} />
                        <button type="submit" className={styles.dangerBtn} aria-label={`Excluir ${article.title}`}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                {editingArticleId === article.id ? <ArticleForm article={article} categories={categories} /> : null}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.panel} aria-label="Gerenciar podcasts">
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Episódios de Podcast</h2>
            <button type="button" className={styles.primaryBtn} onClick={() => setAddingPodcast((v) => !v)}>
              <Plus size={16} aria-hidden="true" />
              <span>{addingPodcast ? "Fechar formulário" : "Novo episódio"}</span>
            </button>
          </div>

          {addingPodcast ? (
            <div className={styles.itemCard}>
              <h3 className={styles.itemTitle}>Adicionar novo episódio de podcast</h3>
              <PodcastForm isNew />
            </div>
          ) : null}

          <div className={styles.itemList}>
            {podcasts.map((podcast) => (
              <article key={podcast.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.thumb}>EP {podcast.episodeNumber}</div>
                  <div className={styles.itemMeta}>
                    <h3 className={styles.itemTitle}>{podcast.title}</h3>
                    <p className={styles.itemDesc}>{podcast.summary}</p>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.pill} ${podcast.status === "published" ? styles.pillActive : ""}`}>
                        {podcast.status === "published" ? "Publicado" : "Rascunho"}
                      </span>
                      <span className={styles.pill}>{podcast.audioUrl ? "Áudio configurado" : "Sem áudio"}</span>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setEditingPodcastId((cur) => (cur === podcast.id ? null : podcast.id))}
                    >
                      {editingPodcastId === podcast.id ? "Fechar" : "Editar"}
                    </button>
                    {!podcast.fromFallback ? (
                      <form action={deletePodcastAction}>
                        <input type="hidden" name="id" value={podcast.id} />
                        <button type="submit" className={styles.dangerBtn} aria-label={`Excluir ${podcast.title}`}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                {editingPodcastId === podcast.id ? <PodcastForm podcast={podcast} /> : null}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
