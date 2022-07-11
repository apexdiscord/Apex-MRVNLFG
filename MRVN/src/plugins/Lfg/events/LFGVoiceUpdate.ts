import { CategoryChannel, TextChannel, VoiceChannel } from "discord.js";
import { noop } from "knub/dist/utils";
import { logger } from "../../../utils/logger";
import { lfgEvent } from "../types";
import { getRandomChannelName } from "../utils/getChannelName";

export const VoiceStateUpdateLFGEvt = lfgEvent({
  event: "voiceStateUpdate",

  async listener(meta) {
    const memberId = meta.args.oldState.member?.id ?? meta.args.newState.member?.id;
    if (!memberId) {
      return;
    }

    const oldState = meta.args.oldState;
    const newState = meta.args.newState;
    const pluginData = meta.pluginData;

    if (newState.channelId === meta.pluginData.state.hubVoice.id) {
      let created: VoiceChannel | null = null;
      const member = await pluginData.guild.members.fetch(newState.id);
      try {
        for (let i = 0; i < pluginData.state.lfgCats.length; i++) {
          const amt = pluginData.state.lfgCatAmt[i];
          if (amt >= pluginData.state.lfgCatLimit) {
            continue;
          }
          try {
            created = await pluginData.guild.channels.create(getRandomChannelName(), {
              parent: pluginData.state.lfgCats[i],
              type: "GUILD_VOICE",
              userLimit: 3,
              reason: "LFG request",
            });
          } catch (e) {
            logger.error(`Category ${pluginData.state.lfgCats[i]} is full unexpectedly`);
            const fullCat = await pluginData.guild.channels.fetch(pluginData.state.lfgCats[i], { force: true }) as CategoryChannel;
            pluginData.state.lfgCatAmt[i] = fullCat.children.size;
            continue;
          }
          pluginData.state.lfgCatAmt[i] = pluginData.state.lfgCatAmt[i] + 1;
          await member.edit({ channel: created.id }, "LFG Request");
          break;
        }
    
        if (!created) {
          logger.warn(`${member.id.slice(0, -3) + `XXX`} failed to create a LFG post because all categories are full`);
          return;
        }
      } catch (e) {
        logger.error(e);
        return;
      }
      return;
    } else if (newState.channelId) {
      const isLfg = await pluginData.state.activeLfgs.findForVoice(newState.channelId);
      if (isLfg) {
        const fetch = await pluginData.guild.channels.fetch(newState.channelId, { force: true }) as VoiceChannel;
        if (fetch.members.size === fetch.userLimit) {
          let textChannel = await pluginData.guild.channels.fetch(isLfg.text_channel_id).catch(noop);
          if (textChannel) {
            textChannel = textChannel as TextChannel;
            const message = await textChannel.messages.fetch(isLfg.message_id).catch(noop);
            if (message) message.delete().catch(noop);
          }
        }

        return;
      }
    }

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
    }
  },
});
