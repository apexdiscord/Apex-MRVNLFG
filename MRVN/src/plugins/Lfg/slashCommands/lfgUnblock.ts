import { lfgEvent } from "../types";
import { logUnblock } from "../utils/userActionLogger";

export const lfgUnblockSlashCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isCommand() ? meta.args.interaction : null;
    if (!interaction || !interaction.isCommand) return;
    if (interaction.commandName !== "unblock") return;

    await interaction.deferReply({ ephemeral: true });

    const initiatorId = interaction.user.id;
    const targetId = interaction.options.getUser("user")!.id;

    if (initiatorId === targetId) {
      await interaction.editReply("You cannot unblock yourself!");
      return;
    }

    const existing = await meta.pluginData.state.blocks.findForInitiatorAndTarget(initiatorId, targetId);
    if (!existing) {
      await interaction.editReply("User is not blocked!");
      return;
    }

    await meta.pluginData.state.blocks.remove(initiatorId, targetId);
    await logUnblock(initiatorId, targetId, meta.pluginData);
    await interaction.editReply(`Successfully unblocked <@${targetId}>!`);
  },
});
