import { SlashCommandBuilder } from "@discordjs/builders";

export const lfgBlocklistSlashCommand = new SlashCommandBuilder()
  .setName("blocklist")
  .setDescription("Lists all users blocked from joining your groups")
  .toJSON();
