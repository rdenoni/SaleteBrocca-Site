import type { ReactNode } from "react";
import { BROWSE_PACE, MotionPace } from "@/motion/MotionPace";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <MotionPace pace={BROWSE_PACE}>{children}</MotionPace>;
}
