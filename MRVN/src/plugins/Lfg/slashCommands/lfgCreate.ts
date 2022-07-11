import { GuildMember } from "discord.js";
import { lfgEvent } from "../types";
import { handleLfgRequest } from "../utils/handleLfgRequest";

export const lfgCreateSlashCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isCommand() ? meta.args.interaction : null;
    if (!interaction || !interaction.isCommand) return;
    if (!interaction.commandName.startsWith("lfg")) return;

    await interaction.deferReply({ ephemeral: true });

    const memberOrId = interaction.member instanceof GuildMember ? interaction.member : interaction.user.id;
    const lfgReturnMessage = await handleLfgRequest(
      memberOrId,
      interaction.options.getString("message")!,
      interaction.channelId,
      interaction.options.getInteger("limit") || 3,
      meta.pluginData,
    );

    await interaction.editReply(lfgReturnMessage);
  },
});
