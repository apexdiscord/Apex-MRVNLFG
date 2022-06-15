import { SlashCommandBuilder } from "@discordjs/builders";

export const lfgCreateSlashCommand = new SlashCommandBuilder()
  .setName("lfg")
  .setDescription("Creates a new LFG post")
  .addStringOption((option) =>
    option.setName("message").setDescription("Your message for the LFG post").setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName("limit")
      .setDescription("The maximum amount of people in the voice channel")
      .addChoices({ name: "2", value: 2 }, { name: "3", value: 3 })
      .setRequired(false),
  )
  .toJSON();
