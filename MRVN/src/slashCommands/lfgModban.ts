import { SlashCommandBuilder } from "@discordjs/builders";

export const lfgModbanSlashCommand = new SlashCommandBuilder()
  .setName("lfgban")
  .setDescription("Bans a user from using LFG entirely")
  .addUserOption((options) => options.setName("user").setDescription("The user to ban from LFG").setRequired(true))
  .toJSON();
