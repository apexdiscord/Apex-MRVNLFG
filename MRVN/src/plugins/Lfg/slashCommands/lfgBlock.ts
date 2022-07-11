import { GuildMember } from "discord.js";
import { lfgEvent } from "../types";
import { incrementOrCreateCounter } from "../utils/counterManager";
import { handleLfgRequest } from "../utils/handleLfgRequest";
import { logBlock } from "../utils/userActionLogger";

export const lfgBlockSlashCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isCommand() ? meta.args.interaction : null;
    if (!interaction || !interaction.isCommand) return;
    if (!interaction.commandName.startsWith( "block")) return;

    await interaction.deferReply({ ephemeral: true });

    const initiatorId = interaction.user.id;
    const targetId = interaction.options.getUser("user")!.id;

    if (initiatorId === targetId) {
      await interaction.editReply("You cannot block yourself!");
      return;
    }

    if (targetId === meta.pluginData.client.user!.id) {
      await interaction.editReply("You cannot block this bot!");
      return;
    }

    const existing = await meta.pluginData.state.blocks.findForInitiatorAndTarget(initiatorId, targetId);
    if (existing) {
      await interaction.editReply("User is already blocked!");
      return;
    }

    await meta.pluginData.state.blocks.add(initiatorId, targetId);
    await incrementOrCreateCounter(targetId, meta.pluginData);
    await logBlock(initiatorId, targetId, meta.pluginData);
    await interaction.editReply(
      `Successfully blocked <@${targetId}>! Use the \`unblock\` command to unblock them.\nIf they are currently in your channel, use the \`kick\` command.`,
    );
  },
});
