import { HeroSequence } from "@/motion/HeroSequence";
import { HOME_HERO } from "@/lib/content/home";

/* Hero da Home: único h1 da página. Foto, texto e botão são os do hero original do site. */
export function HomeHero() {
  return (
    <HeroSequence
      headingLevel="h1"
      title={HOME_HERO.title}
      text={HOME_HERO.text}
      ctaLabel={HOME_HERO.cta.label}
      ctaHref={HOME_HERO.cta.href}
      imageSrc={HOME_HERO.image}
    />
  );
}
