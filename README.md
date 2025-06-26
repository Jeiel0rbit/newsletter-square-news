![](https://cdn.discordapp.com/app-icons/1387780583257673798/6cf75b757a1fa1f3f298555b98616fc7.png?size=256)

# Newsletter Bot para Discord

Este é um bot para Discord projetado para notificar sobre novas publicações de uma newsletter específica, enviando uma mensagem elegante e formatada para um canal de sua escolha. Ele busca atualizações periodicamente na API do [TabNews](https://www.tabnews.com.br/) e, ao encontrar um novo post, o envia para o Discord.

## ✨ Funcionalidades

  * **Verificação Automática:** Verifica novas publicações em intervalos de tempo configuráveis. Padrão é de 5 minutos.
  * **Notificações em Embed:** Envia mensagens formatadas (embeds) no Discord para uma melhor visualização, contendo título, trecho do conteúdo e data de publicação.
  * **Botão de Acesso:** Inclui um botão que leva diretamente para a publicação original, ou seja, fonte da notícia.
  * **Notificação de Erro:** Em caso de falha crítica na verificação, o bot notifica um administrador via mensagem direta.
  * **Fácil Configuração:** Todas as informações sensíveis e de configuração são centralizadas no arquivo `config.json`. Ótimo se estiveres rodando em um servidor próprio.

## 🚀 Começando

Siga estas instruções para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

  * [Node.js](https://nodejs.org/en/) (versão 16.11.0 ou superior)
  * Um bot criado na [plataforma de desenvolvedores do Discord](https://discord.com/developers/applications) com TOKEN.

### Instalação

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/jeiel0rbit/newsletter-squarecloud-bot.git
    ```

2.  **Navegue até o diretório do projeto:**

    ```bash
    cd newsletter-squarecloud-bot
    ```

3.  **Instale as dependências:**

    ```bash
    npm install
    ```

    Isso instalará as dependências necessárias, como `discord.js` e `axios`.

### Configuração

Antes de iniciar o bot, você precisa configurar suas informações no arquivo `config.json`.

```json
{
  "token": "SEU_TOKEN_DO_BOT_AQUI",
  "channelId": "ID_DO_CANAL_DE_NOTIFICACOES",
  "apiEndpoint": "https://www.tabnews.com.br/api/v1/contents/NewsletterOficial",
  "checkInterval": 300000,
  "adminUserId": "SEU_ID_DE_USUARIO_DISCORD"
}
```

  * `token`: O token do seu bot do Discord.
  * `channelId`: O ID do canal de texto onde as notificações serão enviadas.
  * `apiEndpoint`: A URL da API da newsletter que será monitorada. O padrão é a newsletter oficial do TabNews.
  * `checkInterval`: O intervalo em milissegundos para verificar novas publicações.
  * `adminUserId`: O ID do usuário do Discord que receberá notificações de erro, ou seja, o que tem acesso aos logs do bot.

> [!warning]
> `adminUserId` tem que está com DM aberta nas configurações de privacidade da sua conta onde o bot se encontra no seu servidor.

## ▶️ Uso

Após a instalação e configuração, inicie o bot com o seguinte comando:

```bash
npm start
```

O bot ficará online e começará a verificar por novas publicações no intervalo definido.

---

## ☁️ Esse bot está hospeado na Square Cloud

Este projeto está pronto para ser hospedado na [Square Cloud](https://squarecloud.app/). Basta fazer o upload do seu projeto e a plataforma o configurará automaticamente usando o arquivo `squarecloud.config`.

As configurações no arquivo `squarecloud.config` definem:

  * **MAIN**: O arquivo principal a ser executado (`index.js`).
  * **MEMORY**: A quantidade de memória alocada (256MB).
  * **VERSION**: A versão recomendada do Node.js.
  * **DISPLAY\_NAME**: O nome de exibição do seu aplicativo.
  * **AUTORESTART**: Reinício automático em caso de falhas.

> ✍️ Autor
> **Jeiel Miranda** - [Jeiel0rbit](https://www.google.com/search?q=https://github.com/jeiel0rbit)

## 📄 Licença

> [!note]
> Este projeto está sob a licença MIT.
