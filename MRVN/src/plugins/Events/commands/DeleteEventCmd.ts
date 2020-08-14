import { getMemberLevel } from "knub/dist/helpers";
import { noop } from "knub/dist/utils";
import { EmbedOptions, User } from "eris";
import { eventsCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { sendErrorMessage, sendSuccessMessage } from "../../../pluginUtils";
import { resolveUser } from "../../../utils";

export const DeleteEventCmd = eventsCommand({
  trigger: "event delete",
  permission: null,
  source: "guild",

  signature: {
    eventId: ct.number(),
    message: ct.string({ required: false, catchAll: true }),

    full: ct.switchOption({ shortcut: "f" }),
  },

  async run({ message: msg, args, pluginData }) {
    const cfg = pluginData.config.get();
    if (!msg.member.roles.includes(cfg.organizer_role) && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      return;
    }

    const evt = await pluginData.state.guildEvents.findByEventId(args.eventId);
    if (!evt) {
      sendErrorMessage(msg.channel, "There is no event with that ID!");
      return;
    }

    if (evt.creator_id !== msg.author.id && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      sendErrorMessage(msg.channel, "You are not the author of that event!");
      return;
    }

    if (args.full && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      sendErrorMessage(msg.channel, "You do not have permission to use `-full`!");
      return;
    }
    args.message = args.message ? args.message : "";

    pluginData.state.guildEvents.markEventDeleted(evt.id);
    pluginData.state.guildEventParticipants.deleteAllForEventId(evt.id);

    const author = (await resolveUser(pluginData.client, evt.creator_id)) as User;
    const embed: EmbedOptions = {
      fields: [],
    };
    embed.author = { name: author.username, icon_url: author.avatarURL };
    embed.title = evt.title;
    embed.description = "**This event is over!**\n" + args.message;
    embed.color = 0x1c1b1b;

    const evtMsg = await pluginData.client.getMessage(cfg.events_announce_channel, evt.announce_id);
    if (evtMsg && !args.full) {
      await evtMsg.edit({ embed });
      await evtMsg.removeReactions();
    } else if (evtMsg) {
      await evtMsg.delete(`Event fully deleted by moderator ${msg.author.id} with reason ${args.message}`);
    }

    await pluginData.client.deleteChannel(evt.voice_id, "Event deleted by " + msg.author.id).catch(noop);

    let modOverride = "";
    if (getMemberLevel(pluginData, msg.member) >= cfg.level_override) modOverride = "Moderator override:\n";
    sendSuccessMessage(
      msg.channel,
      modOverride + `Event and channel deleted, message ${args.full ? "deleted" : "edited"}!`,
    );
  },
});
