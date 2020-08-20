import { getMemberLevel, createChunkedMessage } from "knub/dist/helpers";
import { eventsCommand } from "../types";
import { sendErrorMessage } from "../../../pluginUtils";
import { commandTypeHelpers as ct } from "../../../commandTypes";

export const ListEventParticipantsCmd = eventsCommand({
  trigger: "event list",
  permission: null,
  source: "guild",

  signature: {
    event: ct.number(),
  },

  async run({ message: msg, args, pluginData }) {
    const cfg = pluginData.config.get();
    const isMod = getMemberLevel(pluginData, msg.member) >= cfg.level_override;
    if (!msg.member.roles.includes(cfg.organizer_role) && !isMod) {
      return;
    }

    const eventParticipants = await pluginData.state.guildEventParticipants.getAllForEventId(args.event);

    if (eventParticipants.length === 0) {
      sendErrorMessage(msg.channel, "No participants for that event");
      return;
    }

    let message = `**Participants for Event ${args.event}:**\n`;
    let accepted = "**Accepted:**\n";
    let pending = "\n**Pending:**\n";
    let denied = "\n**Denied:**\n";

    eventParticipants.forEach((part) => {
      if (part.accepted == null) {
        pending += `<@${part.user_id}>\n`;
      } else if (part.accepted) {
        accepted += `<@${part.user_id}>\n`;
      } else if (!part.accepted) {
        denied += `<@${part.user_id}>\n`;
      }
    });
    message += accepted;
    message += pending;
    message += denied;

    await createChunkedMessage(msg.channel, message.trim());
  },
});
