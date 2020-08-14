import { EmbedOptions, TextableChannel } from "eris";
import { getMemberLevel } from "knub/dist/helpers";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { eventsCommand } from "../types";
import { sendSuccessMessage, sendErrorMessage } from "../../../pluginUtils";

export const CreateEventCmd = eventsCommand({
  trigger: "event create",
  permission: null,
  source: "guild",

  signature: {
    title: ct.string(),
    description: ct.string({ catchAll: true }),

    maxUsers: ct.number({option: true, shortcut: "m"}),
    startTime: ct.delay({option: true, shortcut: "s"}),
  },

  async run({ message: msg, args, pluginData }) {
    const cfg = pluginData.config.get();
    if (!msg.member.roles.includes(cfg.organizer_role) && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      return;
    }
    if (!(msg.channel.id === cfg.organizer_channel)) return;

    if ((await pluginData.state.guildEvents.activeEventAmount()) >= cfg.events_max) {
      sendErrorMessage(msg.channel, "Sorry, but the maximum amount of events is " + cfg.events_max);
      return;
    }

    const announceChan = pluginData.guild.channels.get(cfg.events_announce_channel) as TextableChannel;

    const embed: EmbedOptions = {
      fields: [],
    };
    embed.author = { name: msg.author.username, icon_url: msg.author.avatarURL };
    embed.title = args.title;
    embed.description = args.description;
    embed.footer = { text: "Click 👍 to request to join this event." };
    embed.color = 0x07aeeb;

    const voiceChan = await pluginData.guild.createChannel(
      "" + ((await pluginData.state.guildEvents.highestEventId()) + 1),
      2,
      "Create event vocie channel",
      {
        parentID: cfg.voice_parent_id,
        permissionOverwrites: [{ type: "role", id: pluginData.guild.id, allow: 0, deny: 1024 }],
        topic: args.title,
      },
    );

    const announceMsg = await announceChan.createMessage({ embed });
    announceMsg.addReaction("👍");

    pluginData.state.guildEvents.add(msg.author.id, voiceChan.id, announceMsg.id, args.title, args.description, 0, 0, true, true);

    sendSuccessMessage(msg.channel, `Event \`${args.title}\` created and posted!`);
  },
});
