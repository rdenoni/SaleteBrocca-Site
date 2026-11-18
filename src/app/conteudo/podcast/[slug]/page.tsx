import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PodcastNotice } from "@/components/content/PodcastNotice";
import { PodcastPlayer } from "@/components/content/PodcastPlayer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { getCourse } from "@/lib/content/courses";
import {
  PODCAST_NAME,
  getPodcastEpisode,
  getPodcastEpisodeLessons,
  getPodcastEpisodeNeighbors,
  getPodcastEpisodes,
  podcastEpisodeHref,
} from "@/lib/content/podcasts";
import styles from "../podcast.module.css";

interface PodcastEpisodePageProps {
  params: Promise<{ slug: string }>;
}

const SALETE_SPEAKER = "Salete";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getPodcastEpisodes().map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({ params }: PodcastEpisodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const episode = getPodcastEpisode(slug);
  if (!episode) return {};
  return {
    title: `${episode.title} | Podcast`,
    description: episode.summary,
    /* Episódio simulado (roteiro de exemplo, sem áudio) não entra em buscadores. */
    ...(episode.simulated ? { robots: { index: false } } : {}),
  };
}

export default async function PodcastEpisodePage({ params }: PodcastEpisodePageProps) {
  const { slug } = await params;
  const episode = getPodcastEpisode(slug);
  if (!episode) notFound();

  const course = getCourse(episode.courseSlug);
  const lessons = getPodcastEpisodeLessons(episode);
  const { previous, next } = getPodcastEpisodeNeighbors(episode.slug);

  return (
    <>
      <PageBanner eyebrow={`Episódio ${episode.number}`} title={episode.title} size="compact" />

      <div className={`container ${styles.page}`}>
        <div className={styles.column}>
          <Breadcrumbs
            items={[
              { label: "Conteúdo", href: "/conteudo" },
              { label: "Podcast", href: "/conteudo/podcast" },
              { label: `Episódio ${episode.number}`, href: podcastEpisodeHref(episode) },
            ]}
          />

          <p className={styles.meta}>
            <strong>{PODCAST_NAME}</strong>
            {episode.simulated && <span className="pending">Episódio de exemplo</span>}
          </p>

          <p className={styles.summary}>{episode.summary}</p>

          <PodcastPlayer audioUrl={episode.audioUrl} title={episode.title} />

          {episode.simulated && (
            <PodcastNotice>
              <strong>Episódio simulado.</strong> É um exemplo de pauta: o roteiro abaixo é um rascunho e o áudio
              ainda não foi gravado.
            </PodcastNotice>
          )}

          <section className={styles.section} aria-labelledby="neste-episodio">
            <h2 id="neste-episodio" className={styles.heading}>
              Neste episódio
            </h2>
            <ul className={styles.topics}>
              {episode.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="roteiro">
            <h2 id="roteiro" className={styles.heading}>
              Roteiro
            </h2>
            <div className={styles.script}>
              {episode.script.map((line, index) => (
                <p
                  key={`${index}-${line.speaker}`}
                  className={styles.line}
                  data-speaker={line.speaker === SALETE_SPEAKER ? "salete" : undefined}
                >
                  <strong className={styles.speaker}>{line.speaker}:</strong> {line.text}
                </p>
              ))}
            </div>
          </section>

          {course && (
            <aside className={styles.course} aria-labelledby="do-curso">
              <h2 id="do-curso" className={styles.heading}>
                Do curso
              </h2>
              <p className={styles.courseText}>
                Os temas deste episódio são estudados no curso <strong>{course.title}</strong>, nas aulas:
              </p>
              <ul className={styles.lessons}>
                {lessons.map((lesson) => (
                  <li key={lesson.code}>
                    <span className={styles.lessonTitle}>{lesson.title}</span>
                    <span className={styles.lessonModule}>
                      Módulo {lesson.moduleNumber} · {lesson.moduleTitle}
                    </span>
                  </li>
                ))}
              </ul>
              <p className={styles.notice}>{course.notice}</p>
              <div className={styles.courseActions}>
                <Button href={`/cursos/${course.slug}`} variant="primary">
                  Conhecer o curso
                </Button>
              </div>
            </aside>
          )}

          {(previous || next) && (
            <nav className={styles.pager} aria-label="Outros episódios">
              {previous && (
                <Link href={podcastEpisodeHref(previous)} className={styles.pagerLink} rel="prev">
                  <span className={styles.pagerLabel}>Episódio anterior</span>
                  <span className={styles.pagerTitle}>{previous.title}</span>
                </Link>
              )}
              {next && (
                <Link href={podcastEpisodeHref(next)} className={`${styles.pagerLink} ${styles.pagerNext}`} rel="next">
                  <span className={styles.pagerLabel}>Próximo episódio</span>
                  <span className={styles.pagerTitle}>{next.title}</span>
                </Link>
              )}
            </nav>
          )}

          <LinkArrow href="/conteudo/podcast" className={styles.back}>
            Todos os episódios
          </LinkArrow>
        </div>
      </div>
    </>
  );
}
