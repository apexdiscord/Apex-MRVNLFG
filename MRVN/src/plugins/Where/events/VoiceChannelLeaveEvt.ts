import { TextableChannel, VoiceChannel } from "eris";
import moment from "moment-timezone";
import { whereEvent } from "../types";

export const VoiceChannelLeaveEvt = whereEvent({
  event: "voiceChannelLeave",

  async listener(meta) {
    const pluginData = meta.pluginData;
    const channel = meta.args.oldChannel;
    const member = meta.args.member;

    let obsolete: boolean = false;

    const notifies = await pluginData.state.notifyRequests.getAllForUserId(member.id);

    notifies.forEach(async (notif) => {
      if (moment(notif.endTime) >= moment()) {
        if (notif.persist) {
          const tchannel: TextableChannel = pluginData.guild.channels.get(notif.channel_id) as TextableChannel;
          const voice = pluginData.client.getChannel(channel.id) as VoiceChannel;
          tchannel.createMessage(
            `<@!${notif.requestor_id}> The user <@!${member.id}> disconnected out of the channel \`${voice.name}\``,
          );
        }
      } else {
        obsolete = true;
      }
    });

    if (obsolete) {
      pluginData.state.notifyRequests.removeAllUserNotifiesForUserId(member.id);
    }
  },
});
