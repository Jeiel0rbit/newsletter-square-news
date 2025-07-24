const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
let config = require(configPath);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

let lastKnownId = null;

async function checkForUpdates() {
    try {
        const newApiEndpoint = 'https://www.tabnews.com.br/api/v1/contents/NewsletterOficial?strategy=new';

        const apiConfig = {
            headers: {
                'Cookie': `api_key_beta=${config.apiKeyBeta}`
            }
        };

        const response = await axios.get(newApiEndpoint, apiConfig);

        if (response.data && response.data.length > 0) {
            response.data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

            const latestPostSummary = response.data[0];

            if (lastKnownId === null || latestPostSummary.id !== lastKnownId) {
                lastKnownId = latestPostSummary.id;

                const fullPostResponse = await axios.get(`https://www.tabnews.com.br/api/v1/contents/${latestPostSummary.owner_username}/${latestPostSummary.slug}`, apiConfig);
                const fullPost = fullPostResponse.data;

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

                for (const guildId in config.guilds) {
                    const channelId = config.guilds[guildId];
                    const channel = await client.channels.fetch(channelId);
                    if (channel) {
                        await channel.send({ embeds: [newPostEmbed], components: [row] });
                    }
                }
            }
        }
    } catch (error) {
        console.error('[ERRO FATAL] Ocorreu uma falha no ciclo de verificação:', error.message);
        try {
            const adminUser = await client.users.fetch(config.adminUserId);
            if (adminUser) {
                await adminUser.send(`🚨 **Alerta de Erro no Bot de Notícias!** 🚨\n\nOcorreu um erro crítico que impediu o bot de funcionar corretamente. Por favor, verifique os logs do servidor para mais detalhes.\n\n**Erro:** \`${error.message}\``);
            }
        }
        catch (notificationError) {
            console.error('[ERRO SECUNDÁRIO] Falha ao tentar notificar o administrador sobre o erro.', notificationError);
        }
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, guild, member } = interaction;

    if (commandName === 'set') {
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você precisa ser um administrador para usar este comando.', ephemeral: true });
        }

        const channel = options.getChannel('canal');
        config.guilds[guild.id] = channel.id;

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        interaction.reply({ content: `O canal de notícias foi definido para ${channel}.`, ephemeral: true });
    } else if (commandName === 'doar') {
        const donationEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Apoie o desenvolvedor')
            .setDescription('Sua doação ajuda a manter o bot funcionando e em constante desenvolvimento. Abaixo está a chave PIX para doação:')
            .addFields({ name: 'Chave PIX Aleatória', value: '`08a19869-90c3-48ae-8d8b-98d6ca58d1d8`' });

        interaction.reply({ embeds: [donationEmbed], ephemeral: true });
    }
});

client.once('ready', () => {
    console.log('Bot is online!');
    checkForUpdates();
    setInterval(checkForUpdates, config.checkInterval);
});

client.login(config.token);
