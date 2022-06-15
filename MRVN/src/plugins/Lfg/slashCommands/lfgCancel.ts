import { VoiceChannel } from "discord.js";
import { logger } from "../../../utils/logger";
import { lfgEvent } from "../types";

export const lfgCancelSlashCommandListener = lfgEvent({
  event: "interactionCreate",

  async listener(meta) {
    const interaction = meta.args.interaction.isCommand() ? meta.args.interaction : null;
    if (!interaction || !interaction.isCommand) return;
    if (interaction.commandName !== "cancel") return;

    await interaction.deferReply({ ephemeral: true });

    const userId = interaction.user.id;
    const activeLfg = await meta.pluginData.state.activeLfgs.findForUser(userId);

    if (!activeLfg) {
      await interaction.editReply("You do not have any active LFG requests.");
      logger.info(`${userId.slice(0, -3) + `XXX`} tried to cancel a LFG request but they don't have one`);
      return;
    }

    try {
      const vChannel = (await meta.pluginData.guild.channels.fetch(activeLfg.voice_channel_id)) as VoiceChannel;
      await vChannel.delete();
      await meta.pluginData.state.activeLfgs.removeForVoiceAndUser(activeLfg.voice_channel_id, userId);

      for (let i = 0; i < meta.pluginData.state.lfgCats.length; i++) {
        if (meta.pluginData.state.lfgCats[i] === vChannel.parentId) {
          meta.pluginData.state.lfgCatAmt[i] = meta.pluginData.state.lfgCatAmt[i] - 1;
          break;
        }
      }
    } catch (e) {
      await interaction.editReply("Encoutered an error while canceling your LFG request.\nPlease message ModMail");
      logger.error(e);
      return;
    }

    await interaction.editReply("Cancelled your active LFG request.");
    logger.info(`${userId.slice(0, -3) + `XXX`} cancelled their LFG request`);
  },
});
