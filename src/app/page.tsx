import { AboutPreview } from "@/components/home/AboutPreview";
import { EvaluationSection } from "@/components/home/EvaluationSection";
import { FeaturedContent } from "@/components/home/FeaturedContent";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { FraseConceito } from "@/components/home/FraseConceito";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeHero } from "@/components/home/HomeHero";
import { getFeaturedArticles } from "@/lib/content/articles";
import { getCatalogCourses, getCourses } from "@/lib/content/courses";
import { getTestimonials } from "@/lib/content/testimonials";
import { ScrollProgress } from "@/motion/ScrollProgress";

/* Ordem do Master Brief: Hero, avaliação + depoimentos, conteúdos, sobre, cursos, dúvidas frequentes do curso
   e frase-conceito (light-blue, antes do rodapé navy). O Hero leva o único h1 da página. A seção de depoimentos adicionais
   só existe quando houver depoimentos reais além do destaque: o carrossel entra sozinho com 2 ou mais. */
export default function HomePage() {
  const courses = getCourses();
  return (
    <>
      <ScrollProgress />
      <HomeHero />
      <EvaluationSection testimonials={getTestimonials()} />
      <FeaturedContent articles={getFeaturedArticles()} />
      <AboutPreview />
      <FeaturedCourses courses={getCatalogCourses()} />
      <HomeFaq course={courses[0]} />
      <FraseConceito />
    </>
  );
}
