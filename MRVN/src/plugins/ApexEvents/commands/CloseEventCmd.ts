import { getMemberLevel } from "knub/dist/helpers";
import { apexEventsCommand, TAsk } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";
import { saveAskMessages } from "../utils/saveAskMessages";
import { EmbedOptions, User } from "eris";
import { resolveUser } from "../../../utils";

export const CloseEventCmd = apexEventsCommand({
  trigger: "event close",
  permission: null,
  source: "guild",

  signature: {
    eventId: ct.number(),
  },

  async run({ message: msg, args, pluginData }) {
    const cfg = pluginData.config.get();
    if (!msg.member.roles.includes(cfg.organizer_role) && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      return;
    }

    const evt = pluginData.state.events.find((x) => x.event_id === args.eventId);
    if (!evt) {
      sendErrorMessage(msg.channel, "There is no event with that ID!");
      return;
    }

    if (evt.author_id !== msg.author.id && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      sendErrorMessage(msg.channel, "You are not the author of that event!");
      return;
    }

    const newAsks: TAsk[] = [];
    for (const oldask of pluginData.state.asks) {
      if (args.eventId === oldask.event_id) continue;
      newAsks.push(oldask);
    }
    pluginData.state.asks = newAsks;
    saveAskMessages(pluginData);

    const author = await resolveUser(pluginData.client, evt.author_id) as User;
    const embed: EmbedOptions = {
      fields: [],
    };
    embed.author = { name: author.username, icon_url: author.avatarURL };
    embed.title = evt.event_title;
    embed.description = "**Registration for this event is now closed!**\n" + evt.event_description;
    embed.color = 0x013447;

    const evtMsg = await pluginData.client.getMessage(cfg.events_announce_channel, evt.announce_message_id);
    if (evtMsg) {
      await evtMsg.edit({ embed });
      await evtMsg.removeReactions();
    }

    let modOverride = "";
    if (getMemberLevel(pluginData, msg.member) >= cfg.level_override) modOverride = "Moderator override:\n";
    sendSuccessMessage(msg.channel, modOverride + "Event registration closed, announcement edited!");
  },
});
