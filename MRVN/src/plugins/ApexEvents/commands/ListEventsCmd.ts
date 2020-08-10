import { getMemberLevel } from "knub/dist/helpers";
import { apexEventsCommand } from "../types";
import { resolveUser } from "../../../utils";
import { sendErrorMessage } from "../../../pluginUtils";

export const ListEventCmd = apexEventsCommand({
  trigger: "event list",
  permission: null,
  source: "guild",

  async run({ message: msg, pluginData }) {
    const cfg = pluginData.config.get();
    if (!msg.member.roles.includes(cfg.organizer_role) && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      return;
    }

    if (pluginData.state.events.length === 0) {
      sendErrorMessage(msg.channel, "No active events!");
      return;
    }

    let toSend = `The following ${pluginData.state.events.length} events are currently active:\n`;

    for (const evt of pluginData.state.events) {
      const user = await resolveUser(pluginData.client, evt.author_id);
      toSend += `${evt.event_id}: \`${evt.event_title}\` by ${user.username}#${user.discriminator}\n`;
    }

    await msg.channel.createMessage(toSend);
  },
});
