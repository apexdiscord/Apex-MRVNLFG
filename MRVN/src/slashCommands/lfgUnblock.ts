import { SlashCommandBuilder } from "@discordjs/builders";

export const lfgUnblockSlashCommand = new SlashCommandBuilder()
  .setName("unblock")
  .setDescription("Unblocks a user")
  .addUserOption((options) => options.setName("user").setDescription("The user to unblock").setRequired(true))
  .toJSON();
