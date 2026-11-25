import { requireAdmin } from "@/lib/admin/auth";
import { getAdminHeroSlides, getAdminTestimonials } from "@/lib/admin/cms";
import { HeroCmsClient } from "./HeroCmsClient";

export default async function AdminHeroPage() {
  await requireAdmin("/admin/hero");
  const [slides, testimonials] = await Promise.all([getAdminHeroSlides(), getAdminTestimonials()]);

  return <HeroCmsClient slides={slides} testimonials={testimonials} />;
}
