import { TextChannel } from "discord.js";
import { logger } from "../../../utils/logger";
import { lfgEvent } from "../types";

export const VoiceStateUpdateLFGEvt = lfgEvent({
  event: "voiceStateUpdate",

  async listener(meta) {
    const memberId = meta.args.oldState.member?.id ?? meta.args.newState.member?.id;
    if (!memberId) {
      return;
    }

    const oldState = meta.args.oldState;

    if (oldState.channelId) {
      const activeLfg = await meta.pluginData.state.activeLfgs.findForVoice(oldState.channelId);
      if (!activeLfg) return;

      const tChannel = (await meta.pluginData.guild.channels.fetch(activeLfg.text_channel_id)) as TextChannel;
      if (!tChannel) {
        await meta.pluginData.state.activeLfgs.remove(oldState.channelId);
        throw new Error("Could not find text channel");
      }

      await meta.pluginData.state.activeLfgs.setClaimable(activeLfg.voice_channel_id, activeLfg.user_id, true);
      try {
        if (activeLfg.enabled && activeLfg.user_id === memberId) {
          const message = await tChannel.messages.fetch(activeLfg.message_id);
          await message.delete();
        }
      } catch (e) {
        // Ignore silently - already deleted
      }

      logger.info(`${activeLfg.user_id.slice(0, -3) + `XXX`} left their owned LFG channel, marking it as claimable`);
    }
  },
});
