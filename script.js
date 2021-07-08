// Acessar: https://agendamento.vitoria.es.gov.br/
// colar esse conteũdo no console e rodar: start('NOME COMPETO', 'CPF', 'TELEFONE', 'EMAIL');
//
// start('LUCAS THOM RAMOS', '11111111111', '27996311988', 'thxmxx@gmail.com');
let routine = null;

async function getRecaptchaToken() {
  return await new Promise((resolve) => {
    window.grecaptcha.ready(async () => {
      const token = await window.grecaptcha.execute(
        "6LcwodoaAAAAAKL6uDq4yDzRkzferKf9NUcj0f5a",
        { action: "novoAgendamento" }
      );
      resolve(token);
    });
  });
}

function agendar(nome, cpf, telefone, email, dia, hora, servico, unidade) {
  new Promise((resolve) => {
    window.grecaptcha.ready(async () => {
      const token = await window.grecaptcha.execute(recaptchaKey, {
        action: "novoAgendamento",
      });
      resolve(token);
    });
  }).then(async (token) => {
    fetch("https://agendamento.vitoria.es.gov.br/api/agendamentos", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        data: dia,
        horaDesejada: hora,
        nome,
        documento: cpf,
        tipoDocumento: 1,
        servico,
        unidade,
        telefone,
        email,
        captcha: await getRecaptchaToken(),
        respostas: [],
      }),
    }).then((res) => {
      res.json().then((b) => {
        if(!b.error) {
          console.log('CONSEGUIMOSSSS!!!!!');
          console.log(b);
          stop();
        }
        console.log(b);
      });
    });
  });
}

function getServicos() {
  return new Promise((resolve) => {
    fetch(
      "https://agendamento.vitoria.es.gov.br/api/categorias/2/servicos"
    ).then((res) => {
      res.json().then((j) => resolve(j));
    });
  });
}

function getLocais() {
  return new Promise((resolve) => {
    fetch(
      "https://agendamento.vitoria.es.gov.br/api/servicos/1476/unidades/vagas"
    ).then((res) => {
      res.json().then((j) => resolve(j));
    });
  });
}

function getHorarios(id, mes, dia) {
  return new Promise((resolve) => {
    fetch(
      "https://agendamento.vitoria.es.gov.br/api/servicos/1476/unidades/" +
        id +
        "/horarios/2021-" +
        mes +
        "-" +
        dia +
        "?_=" +
        new Date().getTime()
    ).then((res) => {
      res.json().then((j) => resolve(j));
    });
  });
}

async function start(nome, cpf, telefone, email, stop) {
  let locais = [];
  const resServico = await getServicos();
  let servico = resServico.length ? resServico[0].id : 1476;
  routine = setInterval(async () => {
    if (stop) d;
    if (!locais.length) {
      console.log('Consultando locais de vacinação...');
      locais = await getLocais();
    }
    else {
      console.log('Atualizando locais de vacinação...');
      locais = await getLocais();
      for (let i = 0; i < locais.length; i++) {
        if (!locais[i].vagasdisponiveis) console.log(`Não há vagas disponíveis para ${locais[i].nome}`);
        if (!locais[i].horarios && locais[i].vagasdisponiveis) {
          let today = new Date();
          const h1 = await getHorarios(
            locais[i].id,
            today.getMonth() + 1 < 10
              ? "0" + (today.getMonth() + 1)
              : "" + (today.getMonth() + 1),
            today.getDate() < 10 ? "0" + today.getDate() : "" + today.getDate()
          );
          console.log(locais[i]);
          today.setDate(today.getDate() + 1);
          const h2 = await getHorarios(
            locais[i].id,
            today.getMonth() + 1 < 10
              ? "0" + (today.getMonth() + 1)
              : "" + (today.getMonth() + 1),
            today.getDate() < 10 ? "0" + today.getDate() : "" + today.getDate()
          );
          locais[i].horarios = h1.concat(h2);
          if (!locais[i].horarios.length)
            console.log(
              `Não há horários disponíveis em "${locais[i].nome} - ${
                locais[i].descricao
              }" até ${today.toLocaleString()}`
            );
          else
            console.log(
              `Horarios disponíveis para ${locais[i].descricao}: ${locais[i].horarios}`
            );
        } else {
          if (locais[i].horarios)
            for (let j = 0; j < locais[i].horarios.length; j++) {
              agendar(
                nome,
                cpf,
                telefone,
                email,
                locais[i].inicio,
                locais[i].horarios[j],
                servico,
                locais[i].id
              );
            }
        }
      }
    }
  }, 1000);
}

function stop() {
  if (routine) clearInterval(routine);
}

//start('LUCAS THOM RAMOS', '11111111111', '27996311988', 'thxmxx@gmail.com');
