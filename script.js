// Acessar: https://agendamento.vitoria.es.gov.br/
// colar esse conteũdo no console e rodar: start('NOME COMPETO', 'CPF', 'TELEFONE', 'EMAIL');
//
// start('LUCAS THOM RAMOS', '11111111111', '27996311988', 'thxmxx@gmail.com', 'suá');
let routine = [];

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
        captcha: token,
        respostas: [],
      }),
    }).then((res) => {
      res.json().then((b) => {
        if (!b.error) {
          console.log("CONSEGUIMOS!!!!! Vacina agendada para", nome);
          console.log(b);
          stop(cpf);
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

function getLocais(servicoId) {
  return new Promise((resolve) => {
    fetch(
      "https://agendamento.vitoria.es.gov.br/api/servicos/" + servicoId + "/unidades/vagas"
    ).then((res) => {
      res.json().then((j) => resolve(j));
    });
  });
}

function getHorarios(servicoId, id, mes, dia) {
  return new Promise((resolve) => {
    fetch(
      "https://agendamento.vitoria.es.gov.br/api/" + servicoId + "/1476/unidades/" +
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

async function start(nome, cpf, telefone, email, prioridade) {
  let locais = [];
  const resServico = await getServicos();
  let servico = resServico.length ? resServico[0].id : 1476;
  routine = [
    ...routine,
    {
      timer: setInterval(async () => {
        console.log("Atualizando locais de vacinação...");
        locais = await getLocais(servico);
        if (prioridade) {
          locais = locais.sort((a, b) => {
            if (a.nome.toLowerCase().includes(prioridade.toLowerCase())) return -1;
            if (b.nome.toLowerCase().includes(prioridade.toLowerCase())) return 1;
          });
        }
        for (let i = 0; i < locais.length; i++) {
          console.log("Vagas Disponíveis: ", locais[i].vagasdisponiveis);
          if (locais[i].vagasdisponiveis) {
            let today = new Date();
            const h1 = await getHorarios(
              servico,
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
            if (!locais[i].horarios.length) {
              console.log(
                `Não há horários disponíveis em "${locais[i].nome} - ${
                  locais[i].descricao
                }" até ${today.toLocaleString()}`
              );
            } else {
              console.log(
                `Horarios disponíveis para ${locais[i].descricao}: ${locais[i].horarios}`
              );
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
          } else {
            console.log(`Não há vagas disponíveis para ${locais[i].nome}`);
          }
        }
      }, 2000),
      cpf
    }
  ];
}

function stop(cpf) {
  const timerCpf = routine.find(r => r.cpf === cpf);
  if (timerCpf) clearInterval(timerCpf.timer);
}

//start('LUCAS THOM RAMOS', '11111111111', '27996311988', 'thxmxx@gmail.com', 'suá');
