import { SlashCommandBuilder } from "@discordjs/builders";

export const lfgCancelSlashCommand = new SlashCommandBuilder()
  .setName("cancel")
  .setDescription("Cancels active LFG post")
  .toJSON();
