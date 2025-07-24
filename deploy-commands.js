const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('fs');

const commands = [
    {
        name: 'set',
        description: 'Define o canal para enviar as notícias.',
        options: [
            {
                name: 'canal',
                type: 7, // CHANNEL type
                description: 'O canal para enviar as notícias.',
                required: true,
            },
        ],
    },
    {
        name: 'doar',
        description: 'Faz uma doação para apoiar o desenvolvedor.',
    },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
