import type { Metadata } from "next";
import { PodcastEpisodeGrid } from "@/components/content/PodcastEpisodeGrid";
import { PodcastNotice } from "@/components/content/PodcastNotice";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageBanner } from "@/components/layout/PageBanner";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { PODCAST_NAME, PODCASTS_ARE_SIMULATED, getPodcastEpisodes } from "@/lib/content/podcasts";
import contentStyles from "../conteudo.module.css";
import styles from "./podcast.module.css";

export const metadata: Metadata = {
  /* Episódios simulados (roteiros de exemplo, sem áudio) não entram em buscadores, mesmo quando os artigos entrarem. */
  ...(PODCASTS_ARE_SIMULATED ? { robots: { index: false } } : {}),
  title: "Podcast",
  description: `${PODCAST_NAME}: conversas sobre temas do curso Dificuldades na Aprendizagem, de Maria Salete Brocca Denoni.`,
};

export default function PodcastPage() {
  const episodes = getPodcastEpisodes();

  return (
    <>
      <PageBanner title="Podcast" subtitle={PODCAST_NAME} size="compact" />

      <div className="container">
        <Breadcrumbs
          className={contentStyles.trail}
          items={[
            { label: "Conteúdo", href: "/conteudo" },
            { label: "Podcast", href: "/conteudo/podcast" },
          ]}
        />
      </div>

      <div className={`container ${contentStyles.page}`}>
        <div className={styles.intro}>
          <p className={styles.lead}>
            Conversas sobre temas do curso <strong>Dificuldades na Aprendizagem</strong>, em linguagem clara, para
            quem acompanha crianças em idade escolar.
          </p>
          {PODCASTS_ARE_SIMULATED && (
            <PodcastNotice>
              <strong>Podcast simulado.</strong> Os episódios são exemplos de pauta: o áudio ainda não foi gravado e
              os roteiros são rascunhos.
            </PodcastNotice>
          )}
        </div>

        <section aria-labelledby="episodios">
          <h2 id="episodios" className="visually-hidden">
            Episódios
          </h2>
          <PodcastEpisodeGrid episodes={episodes} />
        </section>

        <LinkArrow href="/conteudo" className={contentStyles.back}>
          Todos os conteúdos
        </LinkArrow>
      </div>
    </>
  );
}
