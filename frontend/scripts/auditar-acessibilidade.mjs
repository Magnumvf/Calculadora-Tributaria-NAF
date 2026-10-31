// Auditoria de acessibilidade (M4): Lighthouse + checagem de rolagem horizontal em 320 px.
// Roda todas as rotas da aplicação no tema escolhido e salva relatórios HTML,
// capturas de tela em 320 px e um resumo em JSON.
//
// Pré-requisitos (ferramentas de auditoria, não fazem parte do build):
//   npm i --no-save lighthouse puppeteer-core chrome-launcher
//   npm run build && npx vite preview --port 4173
// Uso:
//   node scripts/auditar-acessibilidade.mjs http://localhost:4173 ./auditoria claro
//   node scripts/auditar-acessibilidade.mjs http://localhost:4173 ./auditoria-escuro escuro
// Ajuste chromePath abaixo se o Chrome estiver em outro caminho.
import fs from "node:fs";
import path from "node:path";
import * as chromeLauncher from "chrome-launcher";
import puppeteer from "puppeteer-core";
import lighthouse from "lighthouse";

const [base = "http://localhost:4173", saida = "./saida", tema = "claro"] = process.argv.slice(2);
fs.mkdirSync(saida, { recursive: true });

const rotas = [
  ["/", false], ["/login", false], ["/cadastro", false], ["/RecuperarSenha", false],
  ["/faq", false], ["/sobre", false], ["/pagina-inexistente", false],
  ["/Home", true], ["/calculo-pf", true], ["/calculo-pj", true], ["/comparativo", true], ["/historico", true],
];

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });

// Prepara o armazenamento da origem: tema escolhido e um token fictício
// para que as páginas internas renderizem o formulário (sem backend).
async function prepararStorage(comToken) {
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.evaluate((t, tk) => {
    localStorage.setItem("naf-tema", t);
    if (tk) localStorage.setItem("token", "token-de-teste");
    else localStorage.removeItem("token");
  }, tema === "escuro" ? "escuro" : "claro", comToken);
  await page.close();
}

const resumo = [];
for (const [rota, comToken] of rotas) {
  await prepararStorage(comToken);

  // 1) Largura de 320 px: o documento não pode ser mais largo que a tela.
  const page = await browser.newPage();
  await page.setViewport({ width: 320, height: 640, deviceScaleFactor: 1 });
  await page.goto(base + rota, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  const larguras = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    largos: [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > 321 && getComputedStyle(el).position !== "absolute")
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → ${Math.round(el.getBoundingClientRect().right)}px`),
  }));
  const nome = rota === "/" ? "inicio" : rota.slice(1).toLowerCase();
  await page.screenshot({ path: path.join(saida, `320px-${nome}.png`), fullPage: true });
  await page.close();

  // 2) Lighthouse, categoria acessibilidade (emulação móvel padrão).
  const r = await lighthouse(base + rota, {
    port: chrome.port,
    onlyCategories: ["accessibility"],
    disableStorageReset: true,
    output: "html",
    logLevel: "error",
  });
  fs.writeFileSync(path.join(saida, `lighthouse-${nome}.html`), r.report);
  const falhas = Object.values(r.lhr.audits)
    .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode === "binary")
    .map((a) => a.id);
  resumo.push({
    rota,
    acessibilidade: Math.round(r.lhr.categories.accessibility.score * 100),
    largura320: larguras.doc,
    semRolagemHorizontal: larguras.doc <= 320,
    falhas,
    largos: larguras.largos,
  });
}

fs.writeFileSync(path.join(saida, "resumo.json"), JSON.stringify(resumo, null, 2));
console.table(resumo.map(({ largos, falhas, ...r }) => ({ ...r, falhas: falhas.join(",") })));
for (const r of resumo) if (r.largos.length && !r.semRolagemHorizontal) console.log(r.rota, r.largos);
await browser.disconnect();
await chrome.kill();
