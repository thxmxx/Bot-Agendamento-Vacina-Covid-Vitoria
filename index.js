const puppeteer = require("puppeteer");
const fs = require("fs");
const dados = require('./info.json');
const { exit } = require("process");

function describe(jsHandle) {
  return jsHandle.executionContext().evaluate((obj) => {
    // serialize |obj| however you want
    return obj;
  }, jsHandle);
}

if (dados.length === 0) {
  console.log(`Popule as informações no arquivo info.json`);
  exit(1);
}

for (let dado of dados) {
  console.log(`Iniciando o bot para ${dado.nome}.`);
  (async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto("https://agendamento.vitoria.es.gov.br/");

    await page.evaluate(fs.readFileSync("script.js", "utf8"));
    await page.evaluate((d) => {
      start(d.nome, d.cpf, d.telefone, d.email, d.prioridade);
      console.log("Loaded");
    }, {...dado, PRIORIDADE: dado.prioridade});
    page.on("console", async (msg) => {
      const args = await Promise.all(msg.args().map((arg) => describe(arg)));
      if(msg.text() != args[0]) {
        console.log([...args]);
      } else {
        console.log(msg.text());
      }
    });
  })();
}
