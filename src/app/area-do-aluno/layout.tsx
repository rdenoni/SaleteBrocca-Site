import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MotionPace, STUDENT_PACE } from "@/motion/MotionPace";

/* Área privada: nenhuma tela entra nos buscadores. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudentAreaLayout({ children }: { children: ReactNode }) {
  return <MotionPace pace={STUDENT_PACE}>{children}</MotionPace>;
}
