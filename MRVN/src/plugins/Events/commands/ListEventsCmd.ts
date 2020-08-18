import { getMemberLevel } from "knub/dist/helpers";
import { eventsCommand } from "../types";
import { resolveUser } from "../../../utils";
import { sendErrorMessage } from "../../../pluginUtils";

export const ListEventCmd = eventsCommand({
  trigger: "event list",
  permission: null,
  source: "guild",

  async run({ message: msg, pluginData }) {
    const cfg = pluginData.config.get();
    if (!msg.member.roles.includes(cfg.organizer_role) && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      return;
    }

    const activeAmt = await pluginData.state.guildEvents.activeEventAmount();
    if (activeAmt === 0) {
      sendErrorMessage(msg.channel, "No active events!");
      return;
    }

    let toSend = `The following ${activeAmt} events are currently active:\n`;

    const activeEvents = await pluginData.state.guildEvents.getAll(true);
    for (const evt of activeEvents) {
      const user = await resolveUser(pluginData.client, evt.creator_id);
      toSend += `${evt.id}: \`${evt.title}\` by ${user.username}#${user.discriminator}\n`;
    }

    await msg.channel.createMessage(toSend);
  },
});
