const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { token, channelId, apiEndpoint, checkInterval, adminUserId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

let lastKnownId = null;

// Verifica por novas publicações, ordena para encontrar a mais recente e envia uma notificação.
async function checkForUpdates() {
    try {
        const newApiEndpoint = 'https://www.tabnews.com.br/api/v1/contents/NewsletterOficial?strategy=new';
        console.log('[LOG] Buscando a lista de publicações mais recentes...');
        const response = await axios.get(newApiEndpoint);

        if (response.data && response.data.length > 0) {
            response.data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

            const latestPostSummary = response.data[0];
            console.log(`[LOG] Post mais recente encontrado (ID: ${latestPostSummary.id}, Data: ${latestPostSummary.published_at})`);

            if (lastKnownId === null || latestPostSummary.id !== lastKnownId) {
                if (lastKnownId === null) console.log(`[LOG] Primeira verificação. Preparando para enviar o post.`);
                else console.log(`[LOG] Nova atualização encontrada! ID: ${latestPostSummary.id}`);
                
                lastKnownId = latestPostSummary.id;

                const fullPostResponse = await axios.get(`https://www.tabnews.com.br/api/v1/contents/${latestPostSummary.owner_username}/${latestPostSummary.slug}`);
                const fullPost = fullPostResponse.data;
                
                const channel = await client.channels.fetch(channelId);

                if (channel) {
                    const cleanBody = fullPost.body
                        .replace(/\!\[.*?\]\(.*?\)/g, '') 
                        .replace(/[`*#_~>|]/g, '')     
                        .trim();                         

                    const newPostEmbed = new EmbedBuilder()
                        .setColor('#5865F2') 
                        .setTitle(fullPost.title)
                        .setDescription(cleanBody)
                        .setTimestamp(new Date(fullPost.published_at))
                        .setFooter({ text: 'Newsletter • Nova Publicação' });
                    
                    const sourceButton = new ButtonBuilder()
                        .setLabel('Fonte')
                        .setStyle(ButtonStyle.Link)
                        .setURL(fullPost.source_url);

                    const row = new ActionRowBuilder().addComponents(sourceButton);

                    await channel.send({ embeds: [newPostEmbed], components: [row] });
                    console.log('[LOG] MENSAGEM ENVIADA COM SUCESSO!');
                }
            } else {
                console.log('[LOG] Nenhuma nova atualização encontrada.');
            }
        } else {
            console.log('[LOG] A resposta da API não continha dados.');
        }
    } catch (error) {
        console.error('[ERRO FATAL] Ocorreu uma falha no ciclo de verificação:', error.message);
        try {
            const adminUser = await client.users.fetch(adminUserId);
            if (adminUser) {
                await adminUser.send(`🚨 **Alerta de Erro no Bot de Notícias!** 🚨\n\nOcorreu um erro crítico que impediu o bot de funcionar corretamente. Por favor, verifique os logs do servidor para mais detalhes.\n\n**Erro:** \`${error.message}\``);
                console.log(`[LOG] Notificação de erro enviada para o administrador (${adminUserId}).`);
            }
        } catch (notificationError) {
            console.error('[ERRO SECUNDÁRIO] Falha ao tentar notificar o administrador sobre o erro.', notificationError);
        }
    }
}

// Inicia o bot, executa a verificação uma vez e a agenda para rodar em intervalos.
client.once('ready', () => {
    console.log(`Bot ${client.user.tag} está online!`);
    checkForUpdates();
    setInterval(checkForUpdates, checkInterval);
});

client.login(token);