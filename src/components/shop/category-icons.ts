import { FileText, GraduationCap, Gift, Puzzle, Smartphone, type LucideIcon } from "lucide-react";
import type { ShopCategoryId } from "@/types/content";

export const CATEGORY_ICONS: Record<ShopCategoryId, LucideIcon> = {
  cursos: GraduationCap,
  aplicativos: Smartphone,
  jogos: Puzzle,
  kits: Gift,
  materiais: FileText,
};
