const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
// Importa todas as configurações de uma só vez
const { token, channelId, apiEndpoint, checkInterval, adminUserId } = require('./config.json');

// Inicializa o cliente do Discord com as permissões (intents) necessárias
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// Variável para guardar o ID da última publicação enviada
let lastKnownId = null;

// Função principal que verifica e envia as atualizações
async function checkForUpdates() {
    try {
        console.log('[LOG] Buscando a lista de publicações mais recentes...');
        // Busca a lista de conteúdos na API
        const response = await axios.get(apiEndpoint);

        // Se a API retornar dados e a lista não estiver vazia
        if (response.data && response.data.length > 0) {
            const latestPostSummary = response.data[0];
            console.log(`[LOG] Post mais recente encontrado (sumário): ID ${latestPostSummary.id}`);

            // Condição para enviar: primeira vez rodando ou ID do post é novo
            if (lastKnownId === null || latestPostSummary.id !== lastKnownId) {
                if (lastKnownId === null) console.log(`[LOG] Primeira verificação. Preparando para enviar o post.`);
                else console.log(`[LOG] Nova atualização encontrada! ID: ${latestPostSummary.id}`);
                
                // Atualiza o ID mais recente que conhecemos
                lastKnownId = latestPostSummary.id;

                // Busca os detalhes completos do post
                const fullPostResponse = await axios.get(`https://www.tabnews.com.br/api/v1/contents/${latestPostSummary.owner_username}/${latestPostSummary.slug}`);
                const fullPost = fullPostResponse.data;
                
                // Busca o canal do Discord onde a mensagem será enviada
                const channel = await client.channels.fetch(channelId);

                if (channel) {
                    // Limpa caracteres de formatação Markdown
                    const cleanBody = fullPost.body.replace(/[`*#_~>|]/g, '');

                    // --- EMBED ---
                    const newPostEmbed = new EmbedBuilder()
                        .setColor('#5865F2') 
                        .setTitle(fullPost.title)
                        // Descrição do conteúdo
                        .setDescription(cleanBody.substring(0, 450) + (cleanBody.length > 450 ? '...' : ''))
                        .setTimestamp(new Date(fullPost.published_at))
                        // Rodapé genérico
                        .setFooter({ text: 'Newsletter • Nova Publicação' });
                    
                    // Botão para a fonte original
                    const sourceButton = new ButtonBuilder()
                        .setLabel('Fonte')
                        .setStyle(ButtonStyle.Link)
                        .setURL(fullPost.source_url);

                    const row = new ActionRowBuilder().addComponents(sourceButton);

                    // Envia a mensagem final
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

// Evento que dispara uma única vez quando o bot está online e pronto
client.once('ready', () => {
    console.log(`Bot ${client.user.tag} está online!`);
    checkForUpdates();
    setInterval(checkForUpdates, checkInterval);
});

client.login(token);
