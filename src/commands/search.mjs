import { ActionRowBuilder, ComponentType, StringSelectMenuBuilder } from "discord.js";
import { SearchResultType } from "@distube/youtube";
import { isURL } from "distube";

export const Command = {
  name: "search",
  description: "Search for a song",
  options: [
    {
      name: "query",
      description: "The song you want to search for",
      type: 3,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const query = interaction.options.getString("query");
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return await interaction.reply({ content: "Please join a voice channel first", ephemeral: true });
    }

    try {
      if (isURL(query)) {
        return await interaction.reply({ content: "URL is not supported", ephemeral: true });
      }

      const searchResults = await client.youtubeStuff.search(query, {
        type: SearchResultType.VIDEO,
        limit: 3,
        safeSearch: false,
      });

      const selectMenuOptions = searchResults.map((result) => ({
        label: result.name,
        description: `Uploader: ${result.uploader.name}, Duration: ${result.formattedDuration}`,
        value: result.url,
      }));

      const selectMenuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("search")
          .setPlaceholder("Select a song")
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(selectMenuOptions)
      );

      const response = await interaction.reply({
        content: "Select a song",
        components: [selectMenuRow],
      });

      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 30_000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id === interaction.user.id) {
          await interaction.deferUpdate();
          await client.distube.play(voiceChannel, interaction.values[0], {
            member: interaction.member,
            textChannel: interaction.channel,
          });
        } else {
          await interaction.reply({
            content: "These are not for you",
            ephemeral: true,
          });
        }
      });

      collector.on("end", async () => {
        await interaction.editReply({
          components: [],
          content: "Timed Out",
        });
      });
    } catch (error) {
      console.error(error);
    }
  },
};

// Note: Unstable code yet
