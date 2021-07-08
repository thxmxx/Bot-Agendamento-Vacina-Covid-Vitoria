const puppeteer = require("puppeteer");
const fs = require("fs");

const dados = {
  nome: "LUCAS THOM RAMOS",
  cpf: "11111111111",
  telefone: "27996311988",
  email: "thxmxx@gmail.com",
};

(async () => {
  const browser = await puppeteer.launch({ devtools: true });
  const page = await browser.newPage();
  await page.goto("https://agendamento.vitoria.es.gov.br/");

  await page.evaluate(fs.readFileSync("script.js", "utf8"));
  await page.evaluate(() => {
    console.log("Loaded");
  });
  await page.evaluate((d) => {
    start(d.nome, d.cpf, d.telefone, d.email);
    console.log("Loaded");
  }, dados);
  page.on("console", (msg) => console.log("LOG:", msg.text()));

})();
