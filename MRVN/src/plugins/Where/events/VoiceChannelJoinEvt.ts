import { TextableChannel, Member, VoiceChannel } from "eris";
import { whereEvent } from "../types";
import { sendWhere } from "../utils/sendWhere";
import { sendErrorMessage } from "../../../pluginUtils";
import { removeNotifyforUserId } from "../utils/removeNotifyForUserId";
import { removeVCNotifyforChannelId } from "../utils/removeNotifyForChannelId";

export const VoiceChannelJoinEvt = whereEvent({
  event: "voiceChannelJoin",

  async listener(meta) {
    const pluginData = meta.pluginData;

    const newChannel = meta.args.newChannel;
    const member = meta.args.member;
    let obsolete: boolean = false;

    pluginData.state.activeNotifications.forEach(async (notif) => {
      if (notif.subjectId === member.id) {
        if (notif.endTime >= Date.now()) {
          const channel: TextableChannel = pluginData.client.getChannel(notif.channelId) as TextableChannel;
          sendWhere(
            pluginData.guild,
            member,
            channel,
            "<@!" + notif.modId + "> a notification requested by you has triggered:\n",
          );

          if (notif.activeFollow) {
            const modMember: Member = await pluginData.client.getRESTGuildMember(pluginData.guild.id, notif.modId);
            if (modMember.voiceState.channelID != null) {
              try {
                await modMember.edit({
                  channelID: newChannel.id,
                });
              } catch (e) {
                sendErrorMessage(channel, "Failed to move you. Are you in a voice channel?");
                return;
              }
            }
          }

          if (!notif.persist) {
            obsolete = true;
          }
        } else {
          obsolete = true;
        }
      }
    });

    if (obsolete) {
      removeNotifyforUserId(pluginData, member.id);
    }

    obsolete = false;
    pluginData.state.activeVCNotifications.forEach((notif) => {
      if (notif.subjectId === newChannel.id) {
        if (Date.now() >= notif.endTime) {
          obsolete = true;
        } else {
          const text: TextableChannel = pluginData.client.getChannel(notif.channelId) as TextableChannel;
          const voice: VoiceChannel = pluginData.client.getChannel(notif.subjectId) as VoiceChannel;
          text.createMessage(`🟢 <@!${notif.modId}> The user <@!${member.id}> joined the channel \`${voice.name}\``);
        }
      }
    });

    if (obsolete) {
      removeVCNotifyforChannelId(pluginData, member.id);
    }
  },
});
