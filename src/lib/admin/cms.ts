import "server-only";
import { CLINIC_CITY, CLINIC_HOURS, EMAIL, WHATSAPP } from "@/lib/content/contact";
import { SOCIAL_LINKS } from "@/lib/content/site";
import { getTestimonials } from "@/lib/content/testimonials";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { HeroSlide } from "@/motion/HeroSequence";
import type { SocialLink, SocialNetwork, Testimonial } from "@/types/content";

export interface AdminHeroSlide {
  id: string;
  slug: string;
  title: string;
  text: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  imagePosition: string;
  tone: "blue" | "color";
  sortOrder: number;
  isActive: boolean;
  fromFallback?: boolean;
}

export interface AdminTestimonial {
  id: string;
  authorName: string;
  authorRole: string;
  quote: string;
  photoUrl: string;
  sortOrder: number;
  isPublished: boolean;
  simulated?: boolean;
  fromFallback?: boolean;
}

export interface AdminSiteLinks {
  social: Record<SocialNetwork, string>;
  whatsappDisplay: string;
  whatsappHref: string;
  emailDisplay: string;
  emailHref: string;
  clinicCity: string;
  clinicHours: string;
  fromFallback?: boolean;
}

export const FALLBACK_HERO_SLIDES: readonly AdminHeroSlide[] = [
  {
    id: "fallback-cursos",
    slug: "cursos",
    title: "Conheça nossos cursos",
    text: "Formação, conhecimento e ferramentas para compreender as dificuldades de aprendizagem.",
    badge: "",
    ctaLabel: "Explorar cursos",
    ctaHref: "/cursos",
    mediaType: "image",
    mediaUrl: "/images/hero/crianca-escrevendo.jpg",
    imagePosition: "60% 40%",
    tone: "blue",
    sortOrder: 1,
    isActive: true,
    fromFallback: true,
  },
  {
    id: "fallback-alfabetizacao",
    slug: "alfabetizacao",
    title: "Curso de Alfabetização",
    text: "Em breve. Curso em preparação para pais, professores e profissionais que acompanham crianças no início da alfabetização.",
    badge: "Em breve",
    ctaLabel: "Em breve",
    ctaHref: "",
    mediaType: "image",
    mediaUrl: "/images/articles/leitura-fluencia.jpg",
    imagePosition: "55% 35%",
    tone: "blue",
    sortOrder: 2,
    isActive: true,
    fromFallback: true,
  },
  {
    id: "fallback-avaliacao",
    slug: "avaliacao",
    title: "Avaliação fonoaudiológica",
    text: "Atendimento clínico e orientação para famílias e escolas diante de dificuldades na aprendizagem.",
    badge: "",
    ctaLabel: "Pedir avaliação",
    ctaHref: "/avaliacao",
    mediaType: "image",
    mediaUrl: "/images/hero/avaliacao-fonoaudiologica.jpg",
    imagePosition: "65% 30%",
    tone: "blue",
    sortOrder: 3,
    isActive: true,
    fromFallback: true,
  },
  {
    id: "fallback-conteudo",
    slug: "conteudo",
    title: "Conteúdos e artigos",
    text: "Artigos, orientações práticas e reflexões sobre leitura, escrita, fala, audição e aprendizagem.",
    badge: "",
    ctaLabel: "Ver conteúdos",
    ctaHref: "/conteudo",
    mediaType: "image",
    mediaUrl: "/images/articles/familia-e-escola.jpg",
    imagePosition: "55% 35%",
    tone: "blue",
    sortOrder: 4,
    isActive: true,
    fromFallback: true,
  },
];

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function getAdminHeroSlides(): Promise<readonly AdminHeroSlide[]> {
  if (!hasServerDb()) return FALLBACK_HERO_SLIDES;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_HERO_SLIDES;
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      text: row.text,
      badge: row.badge ?? "",
      ctaLabel: row.cta_label,
      ctaHref: row.cta_href ?? "",
      mediaType: row.media_type,
      mediaUrl: row.media_url,
      imagePosition: row.image_position,
      tone: row.tone,
      sortOrder: row.sort_order,
      isActive: row.is_active,
    }));
  } catch {
    return FALLBACK_HERO_SLIDES;
  }
}

export async function getPublicHeroSlides(): Promise<readonly HeroSlide[]> {
  const slides = await getAdminHeroSlides();
  const active = slides.filter((s) => s.isActive);
  const source = active.length > 0 ? active : FALLBACK_HERO_SLIDES;
  return source.map((s) => ({
    id: s.slug,
    title: s.title,
    text: s.text,
    image: s.mediaUrl,
    mediaType: s.mediaType,
    imagePosition: s.imagePosition || "60% 40%",
    tone: s.tone,
    badge: s.badge || undefined,
    ctaLabel: s.ctaLabel,
    ctaHref: s.ctaHref || undefined,
  }));
}

export async function getAdminTestimonials(): Promise<readonly AdminTestimonial[]> {
  const fallback: AdminTestimonial[] = getTestimonials().map((item, idx) => ({
    id: `fallback-${idx + 1}`,
    authorName: item.author,
    authorRole: item.role,
    quote: item.quote,
    photoUrl: item.photo ?? "",
    sortOrder: idx + 1,
    isPublished: true,
    simulated: item.simulated,
    fromFallback: true,
  }));

  if (!hasServerDb()) return fallback;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    return data.map((row) => ({
      id: row.id,
      authorName: row.author_name,
      authorRole: row.author_role,
      quote: row.quote,
      photoUrl: row.photo_url ?? "",
      sortOrder: row.sort_order,
      isPublished: row.is_published,
    }));
  } catch {
    return fallback;
  }
}

export async function getPublicTestimonials(): Promise<readonly Testimonial[]> {
  if (!hasServerDb()) return getTestimonials();
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return getTestimonials();
    return data.map((row) => ({
      author: row.author_name,
      role: row.author_role,
      quote: row.quote,
      photo: row.photo_url || undefined,
      initials: row.photo_url
        ? undefined
        : row.author_name
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join(""),
      avatarTone: "cyan",
    }));
  } catch {
    return getTestimonials();
  }
}

export async function getAdminSiteLinks(): Promise<AdminSiteLinks> {
  const fallback: AdminSiteLinks = {
    social: {
      instagram: SOCIAL_LINKS.find((s) => s.network === "instagram")?.href ?? "",
      facebook: SOCIAL_LINKS.find((s) => s.network === "facebook")?.href ?? "",
      linkedin: SOCIAL_LINKS.find((s) => s.network === "linkedin")?.href ?? "",
      whatsapp: SOCIAL_LINKS.find((s) => s.network === "whatsapp")?.href ?? "",
    },
    whatsappDisplay: WHATSAPP.display,
    whatsappHref: WHATSAPP.href ?? "",
    emailDisplay: EMAIL.display,
    emailHref: EMAIL.href ?? "",
    clinicCity: CLINIC_CITY ?? "",
    clinicHours: CLINIC_HOURS ?? "",
    fromFallback: true,
  };

  if (!hasServerDb()) return fallback;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("site_settings")
      .select("key, value")
      .in("key", ["social_links", "contact_info"]);
    if (error || !data || data.length === 0) return fallback;

    const map = new Map(data.map((r) => [r.key, r.value as Record<string, unknown>]));
    const socialVal = map.get("social_links") ?? {};
    const contactVal = map.get("contact_info") ?? {};

    const str = (obj: Record<string, unknown>, key: string, fb: string) =>
      typeof obj[key] === "string" ? (obj[key] as string) : fb;

    return {
      social: {
        instagram: str(socialVal, "instagram", fallback.social.instagram),
        facebook: str(socialVal, "facebook", fallback.social.facebook),
        linkedin: str(socialVal, "linkedin", fallback.social.linkedin),
        whatsapp: str(socialVal, "whatsapp", fallback.social.whatsapp),
      },
      whatsappDisplay: str(contactVal, "whatsappDisplay", fallback.whatsappDisplay),
      whatsappHref: str(contactVal, "whatsappHref", fallback.whatsappHref),
      emailDisplay: str(contactVal, "emailDisplay", fallback.emailDisplay),
      emailHref: str(contactVal, "emailHref", fallback.emailHref),
      clinicCity: str(contactVal, "clinicCity", fallback.clinicCity),
      clinicHours: str(contactVal, "clinicHours", fallback.clinicHours),
    };
  } catch {
    return fallback;
  }
}

export async function getPublicSocialLinks(): Promise<readonly SocialLink[]> {
  const links = await getAdminSiteLinks();
  return [
    { network: "instagram", label: "Instagram", href: links.social.instagram.trim() || null },
    { network: "facebook", label: "Facebook", href: links.social.facebook.trim() || null },
    { network: "linkedin", label: "LinkedIn", href: links.social.linkedin.trim() || null },
    { network: "whatsapp", label: "WhatsApp", href: links.social.whatsapp.trim() || null },
  ];
}
