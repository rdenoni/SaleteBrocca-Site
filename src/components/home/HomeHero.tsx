import { HeroSequence, type HeroSlide } from "@/motion/HeroSequence";
import { HOME_HERO } from "@/lib/content/home";

/* Hero da Home: único h1 da página. Lê slides do CMS quando cadastrados, com fallback para o hero original. */
export function HomeHero({ slides }: { slides?: readonly HeroSlide[] }) {
  return (
    <HeroSequence
      headingLevel="h1"
      title={HOME_HERO.title}
      text={HOME_HERO.text}
      ctaLabel={HOME_HERO.cta.label}
      ctaHref={HOME_HERO.cta.href}
      imageSrc={HOME_HERO.image}
      slides={slides}
    />
  );
}
