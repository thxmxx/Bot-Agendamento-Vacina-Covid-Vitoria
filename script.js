// Acessar: https://vacina.vilavelha.es.gov.br
// colar esse conteũdo no console e rodar: start('NOME COMPETO', 'CPF', 'TELEFONE', 'EMAIL', 'DATANASC');
//
//start('Fulano da Silva', '11111111111', '2799999999', 'email@gmail.com', 'centro', '1990-12-1');
let routine = null;

function agendar(nome, cpf, telefone, email, dataNascimento, dia, hora, servico, unidade) {
  new Promise((resolve) => {
    window.grecaptcha.ready(async () => {
      const token = await window.grecaptcha.execute(recaptchaKey, {
        action: "novoAgendamento",
      });
      resolve(token);
    });
  }).then(async (token) => {
    fetch("https://vacina.vilavelha.es.gov.br/api/agendamentos", {
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
        dataNascimento,
        respostas: [],
      }),
    })
      .then((res) => {
        res.json().then((b) => {
          if (!b.error) {
            console.log("CONSEGUIMOSSSS!!!!!");
            console.log(b);
            stop();
          }
          console.log(b);
        });
      })
      .catch((err) => {
        console.log("ERRO", err);
      });
  });
}

function getCategorias() {
  return new Promise((resolve) => {
    fetch("https://vacina.vilavelha.es.gov.br/api/categorias")
      .then((res) => {
        res.json().then((j) => resolve(j));
      })
      .catch((err) => {
        console.log("ERRO", err);
        resolve(null);
      });
  });
}

function getServicos(categoria) {
  return new Promise((resolve) => {
    fetch(`https://vacina.vilavelha.es.gov.br/api/categorias/${categoria}/servicos`)
      .then((res) => {
        res.json().then((j) => resolve(j));
      })
      .catch((err) => {
        console.log("ERRO", err);
      });
  });
}

function getLocais(servico) {
  return new Promise((resolve) => {
    fetch(
      `https://vacina.vilavelha.es.gov.br/api/servicos/${servico}/unidades/vagas`
    )
      .then((res) => {
        res.json().then((j) => resolve(j));
      })
      .catch((err) => {
        console.log("ERRO", err);
      });
  });
}

function getHorarios(servico, id, mes, dia) {
  return new Promise((resolve) => {
    fetch(
      `https://agendamento.vitoria.es.gov.br/api/servicos/${servico}/unidades/` +
        id +
        "/horarios/2021-" +
        mes +
        "-" +
        dia +
        "?_=" +
        new Date().getTime()
    )
      .then((res) => {
        res.json().then((j) => resolve(j));
      })
      .catch((err) => {
        console.log("ERRO", err);
      });
  });
}

function getDiaMes(data) {
  let ret = { dia: "", mes: "" };
  ret.mes =
  data.getMonth() + 1 < 10
      ? "0" + (data.getMonth() + 1)
      : "" + (data.getMonth() + 1);
  ret.dia = data.getDate() < 10 ? "0" + data.getDate() : "" + data.getDate();
  return ret;
}

async function start(nome, cpf, telefone, email, dataNascimento, prioridade) {
  let locais = [];
  console.log("Consultando categorias...");
  let categorias = await getCategorias();
  categorias = categorias.filter(c => c.nome.toLowerCase().includes('covid') && c.nome.toLowerCase().includes('1ª dose'))
  if(categorias && categorias.length > 0) {
    let categoria = categorias[0];
    routine = setInterval(async () => {
      console.log("Consultando serviços...");
      let resServico = await getServicos(categoria.id);
      console.log('resServico', resServico);
      resServico = resServico.filter((s) =>
        s.nome.toLowerCase().includes("população geral")
      );
      if (resServico.length > 0) {
        let servico = resServico[0].id;
        console.log("Atualizando locais de vacinação...");
        locais = await getLocais(servico);
        if (prioridade) {
          locais = locais.sort((a, b) => {
            if (a.nome.toLowerCase().includes(prioridade.toLowerCase()))
              return -1;
            if (b.nome.toLowerCase().includes(prioridade.toLowerCase())) return 1;
          });
        }
        console.log('locais', locais);
        for (let i = 0; i < locais.length; i++) {
          console.log("Vagas Disponíveis: ", locais[i].vagasDisponiveis);
          if (locais[i].vagasDisponiveis) {
            let today = new Date(locais[i].inicio);
            const h1 = await getHorarios(
              servico,
              locais[i].id,
              getDiaMes(today).mes,
              getDiaMes(today).dia
            );
            locais[i].horarios = h1;
            if (!locais[i].horarios.length) {
              console.log(
                `Não há horários disponíveis em "${locais[i].descricao}" até ${today.toLocaleString()}`
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
                  dataNascimento,
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
      }
    }, 2000);
  } 
  else {
    start(nome, cpf, telefone, email, dataNascimento, prioridade);
  }
}

function stop() {
  if (routine) clearInterval(routine);
}

//start('Fulano da Silva', '11111111111', '2799999999', 'email@gmail.com', 'centro', '1990-12-1');
