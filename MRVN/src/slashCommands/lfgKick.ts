import { SlashCommandBuilder } from "@discordjs/builders";

export const lfgKickSlashCommand = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kicks a user from a LFG channel you own")
  .toJSON();
