import { getCourses } from "../content/courses";

/** ID de produto da Kiwify → slug do curso (via `kiwify.productId` em courses.ts); null se não for de um curso. */
export function resolveCourseSlugByProductId(productId: string): string | null {
  const course = getCourses().find((candidate) => candidate.kiwify.productId === productId);
  return course?.slug ?? null;
}
