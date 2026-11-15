import { AboutPreview } from "@/components/home/AboutPreview";
import { EvaluationSection } from "@/components/home/EvaluationSection";
import { FeaturedContent } from "@/components/home/FeaturedContent";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { getFeaturedArticles } from "@/lib/content/articles";
import { getCourses } from "@/lib/content/courses";
import { getFeaturedTestimonial } from "@/lib/content/testimonials";

/* Ordem do Master Brief. A seção 8 (depoimentos adicionais) só entra quando houver
   depoimentos reais além do destaque — hoje não há. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <EvaluationSection testimonial={getFeaturedTestimonial()} />
      <FeaturedContent articles={getFeaturedArticles()} />
      <AboutPreview />
      <FeaturedCourses courses={getCourses()} />
      <FinalCta />
    </>
  );
}
