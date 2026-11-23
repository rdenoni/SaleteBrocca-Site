import type { StudentMaterial } from "@/types/content";

/* Biblioteca de PDFs do curso. Os arquivos ficam no bucket privado `materiais` (<curso>/<fileName>); o link é sempre a
   rota `/api/materiais/<id>`, que confere a matrícula antes de entregar. `lessonCodes` vazio = só na biblioteca.
   Sem dependências de servidor: o teste confere os códigos de aula contra o catálogo. */
const MATERIALS_COURSE = "dificuldades-na-aprendizagem";

function pdf(id: string, title: string, fileName: string, lessonCodes: readonly string[]): StudentMaterial {
  return { id, title, courseSlug: MATERIALS_COURSE, format: "PDF", fileName, lessonCodes, href: `/api/materiais/${id}` };
}

export const MATERIALS: readonly StudentMaterial[] = [
  pdf("comece-aqui", "00 · Comece aqui: biblioteca de materiais", "00_COMECE_AQUI_BIBLIOTECA_DE_MATERIAIS_V3.pdf", ["M00_A02"]),
  pdf("guia-pratico", "01 · Guia prático: observe, apoie, encaminhe", "01_GUIA_PRATICO_OBSERVE_APOIE_ENCAMINHE_V3.pdf", ["M01_A01", "M05_A02"]),
  pdf("quadros-essenciais", "02 · Quadros essenciais", "02_QUADROS_ESSENCIAIS_V3.pdf", ["M01_A02", "M02_A01", "M02_A02", "M02_A04", "M02_A05", "M02_A06"]),
  pdf("mapas-visuais", "03 · Mapas visuais da aprendizagem", "03_MAPAS_VISUAIS_DA_APRENDIZAGEM_V3.pdf", ["M01_A03", "M04_A01", "M04_A03", "M05_A01"]),
  pdf("glossario", "04 · Glossário de consulta rápida", "04_GLOSSARIO_DE_CONSULTA_RAPIDA_V3.pdf", []),
  pdf("casos", "05 · Casos para pensar na prática", "05_CASOS_PARA_PENSAR_NA_PRATICA_V3.pdf", ["M02_A02", "M02_A03", "M02_A05", "M02_A06", "M02_A07", "M02_A08"]),
  pdf("ferramentas", "06 · Ferramentas de observação e decisão", "06_FERRAMENTAS_DE_OBSERVACAO_E_DECISAO_V3.pdf", ["M02_A02", "M02_A03", "M02_A05", "M05_A02"]),
  pdf("fichas", "07 · Fichas de registro e acompanhamento", "07_FICHAS_DE_REGISTRO_E_ACOMPANHAMENTO_V3.pdf", ["M01_A01", "M05_A02"]),
  pdf("familia-escola", "08 · Conversa família–escola", "08_CONVERSA_FAMILIA_ESCOLA_V3.pdf", ["M05_A02"]),
  pdf("evidencias", "09 · Evidências, referências e leituras", "09_EVIDENCIAS_REFERENCIAS_E_LEITURAS_V3.pdf", []),
  pdf("revisao-rapida", "10 · Revisão rápida dos 6 módulos", "10_REVISAO_RAPIDA_DOS_6_MODULOS_V3.pdf", ["M00_A02", "M01_A03", "M02_A08", "M03_A03", "M04_A03", "M05_A02"]),
];

export function getMaterials(courseSlug?: string): readonly StudentMaterial[] {
  return courseSlug ? MATERIALS.filter((material) => material.courseSlug === courseSlug) : MATERIALS;
}

export function getMaterial(id: string): StudentMaterial | undefined {
  return MATERIALS.find((material) => material.id === id);
}

export function getLessonMaterials(courseSlug: string, lessonCode: string): readonly StudentMaterial[] {
  return getMaterials(courseSlug).filter((material) => material.lessonCodes.includes(lessonCode));
}
