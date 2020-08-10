import { getMemberLevel } from "knub/dist/helpers";
import { noop } from "knub/dist/utils";
import { apexEventsCommand, TEvent, TAsk } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";
import { saveEventMessages } from "../utils/saveEventMessages";
import { saveAskMessages } from "../utils/saveAskMessages";
import { EmbedOptions, User } from "eris";
import { resolveUser } from "../../../utils";

export const DeleteEventCmd = apexEventsCommand({
  trigger: "event delete",
  permission: null,
  source: "guild",

  signature: {
    eventId: ct.number(),
    message: ct.string({required: false, catchAll: true}),

    full: ct.switchOption({shortcut: "f"}),
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

    if (args.full && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      sendErrorMessage(msg.channel, "You do not have permission to use \`-full\`!");
      return;
    }
    args.message = args.message ? args.message : "";

    const newEvts: TEvent[] = [];
    for (const oldEvt of pluginData.state.events) {
      if (evt.author_id === oldEvt.author_id && evt.event_id === oldEvt.event_id) continue;
      newEvts.push(oldEvt);
    }
    pluginData.state.events = newEvts;
    saveEventMessages(pluginData);

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
    embed.description = "**This event is over!**\n" + args.message;
    embed.color = 0x1c1b1b;

    const evtMsg = await pluginData.client.getMessage(cfg.events_announce_channel, evt.announce_message_id);
    if (evtMsg && !args.full) {
      await evtMsg.edit({ embed });
      await evtMsg.removeReactions();
    } else if (evtMsg) {
      await evtMsg.delete(`Event fully deleted by moderator ${msg.author.id} with reason ${args.message}`);
    }

    await pluginData.client.deleteChannel(evt.voice_channel_id, "Event deleted by " + msg.author.id).catch(noop);

    let modOverride = "";
    if(getMemberLevel(pluginData, msg.member) >= cfg.level_override) modOverride = "Moderator override:\n";
    sendSuccessMessage(msg.channel, modOverride + `Event and channel deleted, message ${args.full ? "deleted" : "edited"}!`);
  },
});
