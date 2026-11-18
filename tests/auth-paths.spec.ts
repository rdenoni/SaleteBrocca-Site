import { expect, test } from "@playwright/test";
import {
  CONFIRM_PATH,
  SET_PASSWORD_PATH,
  STUDENT_HOME,
  defaultNextForType,
  parseConfirmType,
  safeNext,
} from "../src/lib/auth-paths";

/* Lógica pura (sem navegador): roda uma vez, no projeto "desktop". */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "lógica pura: basta rodar uma vez");
});

test.describe("safeNext", () => {
  test("aceita caminhos do próprio site, com busca e hash", () => {
    for (const value of [
      "/area-do-aluno",
      "/area-do-aluno/cursos/dificuldades-na-aprendizagem/aulas/m01-a03",
      "/area-do-aluno/definir-senha?x=1#topo",
      "/area-do-aluno?next=//ainda-no-site",
    ]) {
      expect(safeNext(value)).toBe(value);
    }
  });

  test("recusa destinos externos e variações que o navegador trata como outro site", () => {
    const attacks = [
      "//evil.com",
      "//evil.com/x",
      "/\\evil.com",
      "\\\\evil.com",
      "/.//evil.com",
      "/./\\evil.com",
      "/%2F%2Fevil.com",
      "/%2f%2fevil.com",
      "/%5Cevil.com",
      "https://evil.com",
      "http://evil.com",
      "javascript:alert(1)",
      "evil.com",
      "",
      "/\t/evil.com",
      "/\n/evil.com",
      "/%",
    ];
    for (const value of attacks) {
      expect(safeNext(value), value).toBe(STUDENT_HOME);
    }
  });

  test("valores que não são texto e o destino padrão alternativo", () => {
    expect(safeNext(undefined)).toBe(STUDENT_HOME);
    expect(safeNext(null)).toBe(STUDENT_HOME);
    expect(safeNext(["/area-do-aluno"])).toBe(STUDENT_HOME);
    expect(safeNext("//evil.com", SET_PASSWORD_PATH)).toBe(SET_PASSWORD_PATH);
  });
});

test.describe("link de confirmação do e-mail", () => {
  test("só aceita os tipos conhecidos", () => {
    for (const type of ["invite", "recovery", "email", "signup"]) expect(parseConfirmType(type)).toBe(type);
    for (const type of ["magiclink", "", undefined, null, "INVITE"]) expect(parseConfirmType(type)).toBeUndefined();
  });

  test("convite e recuperação levam a definir a senha; o resto ao painel", () => {
    expect(defaultNextForType("invite")).toBe(SET_PASSWORD_PATH);
    expect(defaultNextForType("recovery")).toBe(SET_PASSWORD_PATH);
    expect(defaultNextForType("email")).toBe(STUDENT_HOME);
    expect(defaultNextForType(undefined)).toBe(STUDENT_HOME);
  });

  test("a página de confirmação fica sob /auth (coberta pelo matcher do proxy)", () => {
    expect(CONFIRM_PATH.startsWith("/auth/")).toBe(true);
  });
});
