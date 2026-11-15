import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/layout/PageBanner";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { countLessons, getCourse, getCourses } from "@/lib/content/courses";

interface PurchasePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: PurchasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return { title: `Inscrição: ${course.title}`, robots: { index: false } };
}

/* Somente visual nesta etapa: nenhum dado é enviado e não há gateway de pagamento. */
export default async function PurchasePage({ params }: PurchasePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <>
      <PageBanner eyebrow={course.title} title="Inscrição" size="compact" />
      <CheckoutView
        item={{
          title: course.title,
          details: [`${course.modules.length} módulos`, `${countLessons(course)} aulas`],
          price: course.commercial.price,
        }}
        stepsLabel="Etapas da inscrição"
        backHref={`/cursos/${course.slug}`}
        backLabel="Voltar ao curso"
        idPrefix="compra"
      />
    </>
  );
}
