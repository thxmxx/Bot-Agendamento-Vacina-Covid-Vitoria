const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

const dados = {
  nome: process.env.NOME,
  cpf: process.env.CPF,
  telefone: process.env.TELEFONE,
  email: process.env.EMAIL,
  dataNasc: process.env.DATANASC
};

function describe(jsHandle) {
  return jsHandle.executionContext().evaluate((obj) => {
    // serialize |obj| however you want
    return obj;
  }, jsHandle);
}

if (dados.nome && dados.cpf && dados.telefone && dados.email && dados.dataNasc) {
  console.log(`Iniciando o bot para ${dados.nome}.`);
  (async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto("https://vacina.vilavelha.es.gov.br/#/");

    await page.evaluate(fs.readFileSync("script.js", "utf8"));
    await page.evaluate((d) => {
      start(d.nome, d.cpf, d.telefone, d.email, d.dataNasc, d.PRIORIDADE);
      console.log("Loaded");
    }, {...dados, PRIORIDADE: process.env.PRIORIDADE});
    page.on("console", async (msg) => {
      const args = await Promise.all(msg.args().map((arg) => describe(arg)));
      if(msg.text() != args[0]) {
        console.log([...args]);
      } else {
        console.log(msg.text());
      }
    });
  })();
} else {
  console.log(`Configure seus dados no arquivo '.env'.`);
}
