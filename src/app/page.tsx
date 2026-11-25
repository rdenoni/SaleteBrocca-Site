import { AboutPreview } from "@/components/home/AboutPreview";
import { EvaluationSection } from "@/components/home/EvaluationSection";
import { FeaturedContent } from "@/components/home/FeaturedContent";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { FraseConceito } from "@/components/home/FraseConceito";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeHero } from "@/components/home/HomeHero";
import { getPublicHeroSlides, getPublicTestimonials } from "@/lib/admin/cms";
import { getFeaturedArticles } from "@/lib/content/articles";
import { getCatalogCourses, getCourses } from "@/lib/content/courses";
import { ScrollProgress } from "@/motion/ScrollProgress";

/* Ordem do Master Brief: Hero, avaliação + depoimentos, conteúdos, sobre, cursos, dúvidas frequentes do curso
   e frase-conceito (light-blue, antes do rodapé navy). O Hero leva o único h1 da página. A seção de depoimentos adicionais
   só existe quando houver depoimentos reais além do destaque: o carrossel entra sozinho com 2 ou mais. */
export default async function HomePage() {
  const courses = getCourses();
  const [heroSlides, testimonials] = await Promise.all([getPublicHeroSlides(), getPublicTestimonials()]);
  return (
    <>
      <ScrollProgress />
      <HomeHero slides={heroSlides} />
      <EvaluationSection testimonials={testimonials} />
      <FeaturedContent articles={getFeaturedArticles()} />
      <AboutPreview />
      <FeaturedCourses courses={getCatalogCourses()} />
      <HomeFaq course={courses[0]} />
      <FraseConceito />
    </>
  );
}
