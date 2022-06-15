import { VoiceChannel } from "discord.js";
import { logger } from "../../../utils/logger";
import { lfgEvent } from "../types";

export const VoiceStateUpdateLFGEmptyEvt = lfgEvent({
  event: "voiceStateUpdate",

  async listener(meta) {
    const memberId = meta.args.oldState.member?.id ?? meta.args.newState.member?.id;
    if (!memberId) {
      return;
    }

    const oldState = meta.args.oldState;

    if (oldState.channelId) {
      const vChannel = (await meta.pluginData.guild.channels.fetch(oldState.channelId)) as VoiceChannel;
      if (vChannel == null) {
        await meta.pluginData.state.activeLfgs.remove(oldState.channelId);
        return;
      }
      if (!vChannel.parentId) return;
      if (meta.pluginData.state.lfgCats.includes(vChannel.parentId)) {
        if (vChannel.members.size === 0) {
          try {
            await meta.pluginData.state.activeLfgs.remove(oldState.channelId);
            await vChannel.delete();
            logger.info(`Last user left LFG channel ${oldState.channelId}, deleting it`);
          } catch (e) {
            // Probably a cancelled LFG request
            return;
          }
          for (let i = 0; i < meta.pluginData.state.lfgCats.length; i++) {
            if (meta.pluginData.state.lfgCats[i] === vChannel.parentId) {
              meta.pluginData.state.lfgCatAmt[i] = meta.pluginData.state.lfgCatAmt[i] - 1;
              break;
            }
          }
        }
      }
    }
  },
});
