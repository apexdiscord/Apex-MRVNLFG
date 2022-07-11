import { getMemberLevel } from "knub/dist/helpers";
import { logger } from "../../../utils/logger";
import { lfgEvent } from "../types";
import { logBan, logUnblock } from "../utils/userActionLogger";

export const lfgModbanSlashCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isCommand() ? meta.args.interaction : null;
    if (!interaction || !interaction.isCommand) return;
    if (!interaction.commandName.startsWith("lfgban")) return;

    await interaction.deferReply({ ephemeral: true });

    const initiatorId = interaction.user.id;
    const targetId = interaction.options.getUser("user")!.id;

    const initiatorMember = await meta.pluginData.guild.members.fetch({ user: initiatorId });
    if (getMemberLevel(meta.pluginData, initiatorMember) < 50) {
      logger.error(`${initiatorId} tried to ban ${targetId} but they are not a mod or higher`);
      await interaction.editReply("Insufficient permissions");
      return;
    }

    if (initiatorId === targetId) {
      await interaction.editReply("You cannot ban yourself!");
      return;
    }

    const existing = await meta.pluginData.state.modbans.isBanned(targetId);
    if (existing) {
      await interaction.editReply("User is already banned!");
      return;
    }

    await meta.pluginData.state.modbans.add(initiatorId, targetId);
    await logBan(initiatorId, targetId, meta.pluginData);
    await interaction.editReply(`Successfully banned <@${targetId}>!`);
  },
});
