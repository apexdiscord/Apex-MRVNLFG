import { getMemberLevel } from "knub/dist/helpers";
import { VoiceChannel } from "eris";
import { noop } from "knub/dist/utils";
import { eventsCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";

export const EditEventParticipantCmd = eventsCommand({
  trigger: ["event participant", "event p"],
  permission: null,
  source: "guild",

  signature: {
    event: ct.number(),
    participant: ct.resolvedMember(),

    accept: ct.switchOption({ shortcut: "a" }),
    deny: ct.switchOption({ shortcut: "d" }),
  },

  async run({ message: msg, args, pluginData }) {
    const cfg = pluginData.config.get();
    const isMod = getMemberLevel(pluginData, msg.member) >= cfg.level_override;
    if (!msg.member.roles.includes(cfg.organizer_role) && !isMod) {
      return;
    }

    const evt = await pluginData.state.guildEvents.findByEventId(args.event, true);
    if (!evt) {
      sendErrorMessage(msg.channel, "No active event with that ID");
      return;
    }

    let accepted = false;
    if ((args.accept && args.deny) || (!args.accept && !args.deny)) {
      sendErrorMessage(msg.channel, "Must have either accept *or* deny");
      return;
    } else if (args.accept) {
      accepted = true;
    }

    const evtPart = await pluginData.state.guildEventParticipants.getByEventAndUserId(args.event, args.participant.id);
    if (evtPart) {
      await pluginData.state.guildEventParticipants.setAcceptedForEventIdAndUserId(evt.id, evtPart.user_id, accepted);
    } else {
      await pluginData.state.guildEventParticipants.add(evt.id, args.participant.id, null, accepted);
    }

    const vc = pluginData.guild.channels.get(evt.voice_id) as VoiceChannel;
    if (accepted) {
      vc.editPermission(args.participant.id, 1048576, 0, "member");
    } else {
      vc.deletePermission(args.participant.id);

      if (vc.voiceMembers.has(args.participant.id)) {
        args.participant
          .edit({
            channelID: null,
          })
          .catch(noop);
      }
    }

    sendSuccessMessage(
      msg.channel,
      `User ${args.participant.mention} set to ${accepted ? "accepted" : "denied"} for Event ${evt.id}`,
    );
  },
});
