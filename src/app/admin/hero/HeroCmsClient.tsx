"use client";

import { Image as ImageIcon, MessageSquareQuote, Plus, Save, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import type { AdminHeroSlide, AdminTestimonial } from "@/lib/admin/cms";
import {
  deleteHeroSlideAction,
  deleteTestimonialAction,
  saveHeroSlideAction,
  saveTestimonialAction,
  type AdminActionState,
} from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

function HeroSlideForm({ slide, isNew }: { slide?: AdminHeroSlide; isNew?: boolean }) {
  const [state, action, pending] = useActionState(saveHeroSlideAction, INITIAL_STATE);

  return (
    <form action={action} className={styles.form}>
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Título do banner *</span>
          <input className={styles.input} name="title" required defaultValue={slide?.title ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Slug (identificador único)</span>
          <input
            className={styles.input}
            name="slug"
            placeholder="ex.: curso-alfabetizacao"
            defaultValue={slide?.slug ?? ""}
          />
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Texto de apoio</span>
          <textarea className={styles.textarea} name="text" defaultValue={slide?.text ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Texto do botão (CTA)</span>
          <input className={styles.input} name="ctaLabel" defaultValue={slide?.ctaLabel ?? "Explorar cursos"} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Link do botão (vazio = desativado)</span>
          <input className={styles.input} name="ctaHref" placeholder="/cursos" defaultValue={slide?.ctaHref ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Selo opcional (ex.: Em breve)</span>
          <input className={styles.input} name="badge" defaultValue={slide?.badge ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Tipo de mídia</span>
          <select className={styles.select} name="mediaType" defaultValue={slide?.mediaType ?? "image"}>
            <option value="image">Imagem (JPG/PNG/WebP)</option>
            <option value="video">Vídeo em loop (MP4)</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>URL da imagem/vídeo</span>
          <input
            className={styles.input}
            name="mediaUrl"
            placeholder="/images/hero/..."
            defaultValue={slide?.mediaUrl ?? ""}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ou enviar arquivo (até 20 MB)</span>
          <input className={styles.input} type="file" name="mediaFile" accept="image/*,video/mp4" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Foco da imagem (object-position)</span>
          <input className={styles.input} name="imagePosition" defaultValue={slide?.imagePosition ?? "60% 40%"} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ordem de exibição</span>
          <input className={styles.input} type="number" name="sortOrder" defaultValue={slide?.sortOrder ?? 1} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Tratamento de cor</span>
          <select className={styles.select} name="tone" defaultValue={slide?.tone ?? "blue"}>
            <option value="blue">Azul institucional da marca</option>
            <option value="color">Foto colorida com véu azul</option>
          </select>
        </label>
        <label className={styles.checkboxRow}>
          <input type="checkbox" name="isActive" defaultChecked={slide ? slide.isActive : true} />
          <span>Slide ativo na Hero da Home</span>
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
          <span>{pending ? "Salvando..." : isNew ? "Adicionar slide" : "Salvar alterações"}</span>
        </button>
      </div>
    </form>
  );
}

function TestimonialForm({ item, isNew }: { item?: AdminTestimonial; isNew?: boolean }) {
  const [state, action, pending] = useActionState(saveTestimonialAction, INITIAL_STATE);

  return (
    <form action={action} className={styles.form}>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Nome do autor *</span>
          <input className={styles.input} name="authorName" required defaultValue={item?.authorName ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Perfil / Relação</span>
          <input
            className={styles.input}
            name="authorRole"
            placeholder="Ex.: Mãe de paciente, Professora"
            defaultValue={item?.authorRole ?? ""}
          />
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.label}>Texto do comentário / depoimento *</span>
          <textarea className={styles.textarea} name="quote" required defaultValue={item?.quote ?? ""} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>URL da foto (opcional)</span>
          <input
            className={styles.input}
            name="photoUrl"
            placeholder="/images/testimonials/..."
            defaultValue={item?.photoUrl ?? ""}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ou enviar foto (JPG/PNG/WebP)</span>
          <input className={styles.input} type="file" name="photoFile" accept="image/*" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ordem de exibição</span>
          <input className={styles.input} type="number" name="sortOrder" defaultValue={item?.sortOrder ?? 1} />
        </label>
        <label className={styles.checkboxRow}>
          <input type="checkbox" name="isPublished" defaultChecked={item ? item.isPublished : true} />
          <span>Publicado na Home e em Avaliação</span>
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
          <span>{pending ? "Salvando..." : isNew ? "Adicionar comentário" : "Salvar comentário"}</span>
        </button>
      </div>
    </form>
  );
}

export function HeroCmsClient({
  slides,
  testimonials,
}: {
  slides: readonly AdminHeroSlide[];
  testimonials: readonly AdminTestimonial[];
}) {
  const [tab, setTab] = useState<"hero" | "testimonials">("hero");
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [addingSlide, setAddingSlide] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [addingTestimonial, setAddingTestimonial] = useState(false);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Hero & Depoimentos</h1>
        <p className={styles.subtitle}>
          Gerencie os banners da Hero da Home (fotos, vídeos em loop e textos) e os comentários/depoimentos publicados
          no site.
        </p>
        <div className={styles.tabs} role="tablist" aria-label="Seções de Hero e Depoimentos">
          <button
            type="button"
            role="tab"
            className={styles.tabBtn}
            aria-selected={tab === "hero"}
            onClick={() => setTab("hero")}
          >
            <ImageIcon size={17} aria-hidden="true" />
            <span>Banners da Hero ({slides.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            className={styles.tabBtn}
            aria-selected={tab === "testimonials"}
            onClick={() => setTab("testimonials")}
          >
            <MessageSquareQuote size={17} aria-hidden="true" />
            <span>Comentários / Depoimentos ({testimonials.length})</span>
          </button>
        </div>
      </header>

      {tab === "hero" ? (
        <section className={styles.panel} aria-label="Banners da Hero">
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Slides da Hero</h2>
            <button type="button" className={styles.primaryBtn} onClick={() => setAddingSlide((v) => !v)}>
              <Plus size={16} aria-hidden="true" />
              <span>{addingSlide ? "Fechar formulário" : "Novo banner"}</span>
            </button>
          </div>

          {addingSlide ? (
            <div className={styles.itemCard}>
              <h3 className={styles.itemTitle}>Adicionar novo slide na Hero</h3>
              <HeroSlideForm isNew />
            </div>
          ) : null}

          <div className={styles.itemList}>
            {slides.map((slide) => (
              <article key={slide.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.thumb}>
                    {slide.mediaType === "video" ? (
                      <video src={slide.mediaUrl} muted playsInline />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={slide.mediaUrl} alt="" />
                    )}
                  </div>
                  <div className={styles.itemMeta}>
                    <h3 className={styles.itemTitle}>{slide.title}</h3>
                    <p className={styles.itemDesc}>{slide.text}</p>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.pill} ${slide.isActive ? styles.pillActive : ""}`}>
                        {slide.isActive ? "Ativo" : "Oculto"}
                      </span>
                      <span className={styles.pill}>Ordem {slide.sortOrder}</span>
                      <span className={styles.pill}>{slide.mediaType === "video" ? "Vídeo" : "Foto"}</span>
                      {slide.fromFallback ? <span className={styles.pill}>Padrão do código</span> : null}
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setEditingSlideId((cur) => (cur === slide.id ? null : slide.id))}
                    >
                      {editingSlideId === slide.id ? "Fechar" : "Editar"}
                    </button>
                    {!slide.fromFallback ? (
                      <form action={deleteHeroSlideAction}>
                        <input type="hidden" name="id" value={slide.id} />
                        <button type="submit" className={styles.dangerBtn} aria-label={`Excluir ${slide.title}`}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                {editingSlideId === slide.id ? <HeroSlideForm slide={slide} /> : null}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.panel} aria-label="Comentários e depoimentos">
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Comentários / Depoimentos</h2>
            <button type="button" className={styles.primaryBtn} onClick={() => setAddingTestimonial((v) => !v)}>
              <Plus size={16} aria-hidden="true" />
              <span>{addingTestimonial ? "Fechar formulário" : "Novo comentário"}</span>
            </button>
          </div>

          {addingTestimonial ? (
            <div className={styles.itemCard}>
              <h3 className={styles.itemTitle}>Adicionar novo comentário / depoimento</h3>
              <TestimonialForm isNew />
            </div>
          ) : null}

          <div className={styles.itemList}>
            {testimonials.map((item) => (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.avatarThumb}>
                    {item.photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.photoUrl} alt="" />
                    ) : (
                      item.authorName
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase() ?? "")
                        .join("")
                    )}
                  </div>
                  <div className={styles.itemMeta}>
                    <h3 className={styles.itemTitle}>{item.authorName}</h3>
                    <p className={styles.itemDesc}>“{item.quote}”</p>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.pill} ${item.isPublished ? styles.pillActive : ""}`}>
                        {item.isPublished ? "Publicado" : "Rascunho"}
                      </span>
                      {item.authorRole ? <span className={styles.pill}>{item.authorRole}</span> : null}
                      {item.simulated ? <span className={styles.pill}>Simulado</span> : null}
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setEditingTestimonialId((cur) => (cur === item.id ? null : item.id))}
                    >
                      {editingTestimonialId === item.id ? "Fechar" : "Editar"}
                    </button>
                    {!item.fromFallback ? (
                      <form action={deleteTestimonialAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={styles.dangerBtn} aria-label={`Excluir ${item.authorName}`}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                {editingTestimonialId === item.id ? <TestimonialForm item={item} /> : null}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
