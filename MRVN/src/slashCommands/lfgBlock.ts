import { SlashCommandBuilder } from "@discordjs/builders";

export const lfgBlockSlashCommand = new SlashCommandBuilder()
  .setName("block")
  .setDescription("Blocks a user from joining your groups")
  .addUserOption((options) => options.setName("user").setDescription("The user to block").setRequired(true))
  .toJSON();
