import { TextableChannel, Member, VoiceChannel } from "eris";
import { whereEvent } from "../types";
import { removeNotifyforUserId } from "../utils/removeNotifyForUserId";
import { removeVCNotifyforChannelId } from "../utils/removeNotifyForChannelId";

export const VoiceChannelLeaveEvt = whereEvent({
  event: "voiceChannelLeave",

  async listener(meta) {
    const pluginData = meta.pluginData;
    const channel = meta.args.oldChannel;
    const member = meta.args.member;

    let obsolete: boolean = false;

    pluginData.state.activeVCNotifications.forEach((notif) => {
      if (notif.subjectId === channel.id) {
        if (Date.now() >= notif.endTime) {
          obsolete = true;
        } else {
          const text = pluginData.client.getChannel(notif.channelId) as TextableChannel;
          const voice = pluginData.client.getChannel(notif.subjectId) as VoiceChannel;
          text.createMessage(
            `🔴 <@!${notif.modId}> The user <@!${member.id}> disconnected out of the channel \`${voice.name}\``,
          );
        }
      }
    });

    if (obsolete) {
      removeVCNotifyforChannelId(pluginData, member.id);
    }

    pluginData.state.activeNotifications.forEach(async (notif) => {
      if (notif.subjectId === member.id) {
        if (notif.endTime >= Date.now()) {
          if (notif.persist) {
            const tchannel = pluginData.client.getChannel(notif.channelId) as TextableChannel;
            const voice = pluginData.client.getChannel(channel.id) as VoiceChannel;
            tchannel.createMessage(
              `<@!${notif.modId}> The user <@!${member.id}> disconnected out of the channel \`${voice.name}\``,
            );
          }
        } else {
          obsolete = true;
        }
      }
    });

    if (obsolete) {
      removeNotifyforUserId(pluginData, member.id);
    }
  },
});
