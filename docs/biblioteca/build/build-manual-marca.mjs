// Gera docs/biblioteca/manual-da-marca.html (fragmento, mesmo formato das outras páginas da biblioteca)
// a partir de src/manual-marca.head.html + design-system.css (base) + manual-marca.css + .body.html + .js.
// As figuras ficam em docs/biblioteca/manual-da-marca/ (webp recortados do PDF do manual) e são lidas por caminho relativo.
// Uso: node docs/biblioteca/build/build-manual-marca.mjs [--deploy <pasta public/biblioteca do DEPLOY>]
//   --deploy grava a versão com <!doctype>/<head> completos e copia a pasta de figuras.
import { cpSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BOM = String.fromCharCode(0xfeff);
const NL = String.fromCharCode(10);
const read = (p) => {
  const text = readFileSync(join(root, p), "utf8");
  return text.startsWith(BOM) ? text.slice(1) : text;
};

const head = read("src/manual-marca.head.html").trimEnd();
const rest = [
  "<style>" + NL + read("src/design-system.css").trimEnd() + NL + NL + read("src/manual-marca.css").trimEnd() + NL + "</style>",
  read("src/manual-marca.body.html").trimEnd(),
  "<script>" + NL + read("src/manual-marca.js").trimEnd() + NL + "</script>",
  "",
].join(NL);

const html = head + NL + rest;
writeFileSync(join(root, "manual-da-marca.html"), html, "utf8");
console.log(`manual-da-marca.html gerado: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);

const i = process.argv.indexOf("--deploy");
if (i !== -1) {
  const dest = process.argv[i + 1];
  if (!dest) throw new Error("--deploy precisa do caminho de public/biblioteca");
  const doc =
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<meta name="robots" content="noindex,nofollow"><link rel="icon" href="/brand/logo/icone-app.png">' +
    head + "</head><body>" + NL + rest + "</body></html>" + NL;
  writeFileSync(join(dest, "manual-da-marca.html"), doc, "utf8");
  cpSync(join(root, "manual-da-marca"), join(dest, "manual-da-marca"), { recursive: true });
  console.log(`cópia de deploy em ${dest}`);
}
