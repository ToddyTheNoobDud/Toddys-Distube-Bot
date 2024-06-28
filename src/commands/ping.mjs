import { EmbedBuilder } from 'discord.js'

export const Command = {
    name: "ping",
    description: "Pong!",
    run: async(client, interaction) => {
        const apiPing = client.ws.ping;
        const ping = Date.now() - interaction.createdTimestamp;
        const embed = new EmbedBuilder()
        .addFields([
            {
                name: "API Ping",
                value: `\`${apiPing}\` ms`,
                inline: true,
            },
            {
                name: "Bot Ping",
                value: `\`${ping}\` ms`,
                inline: true,
            }
        ])
        .setColor("Blue")
        await interaction.reply({ embeds: [embed] });
    }
}