# Versão para Vitória, o bot para Vila Velha está no branch [vila-velha](https://github.com/thxmxx/Bot-Agendamento-Vacina-Covid-Vitoria/tree/vila-velha)

## Chrome

Abra o [script](https://raw.githubusercontent.com/thxmxx/Bot-Agendamento-Vacina-Covid-Vitoria/main/script.js) e siga as instruções (para abrir o console do chrome aperte `F12`):

![Exemplo](howto.gif)

## Docker

```
docker run -e NOME="Fulano da Silva" -e CPF="11111111111" -e TELEFONE="2799999999" -e EMAIL="fulano@gmail.com" -e PRIORIDADE="centro" -it thxmxx/vacina-vitoria:1.0.5a
```

## Node.js
1. ```
    npm install
    ```

2. ```
    node index.js
    ```
