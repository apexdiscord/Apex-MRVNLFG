import { EmbedOptions, TextableChannel } from "eris";
import { getMemberLevel } from "knub/dist/helpers";
import moment from "moment-timezone";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { eventsCommand } from "../types";
import { sendSuccessMessage, sendErrorMessage } from "../../../pluginUtils";
import { logger } from "../../../logger";

export const CreateEventCmd = eventsCommand({
  trigger: "event create",
  permission: null,
  source: "guild",

  signature: {
    title: ct.string(),
    description: ct.string({ catchAll: true }),

    acceptInfo: ct.string({ option: true, shortcut: "a" }),
    startDelay: ct.delay({ option: true, shortcut: "s" }),
  },

  async run({ message: msg, args, pluginData }) {
    const cfg = pluginData.config.get();
    if (!msg.member.roles.includes(cfg.organiser_role) && getMemberLevel(pluginData, msg.member) < cfg.level_override) {
      return;
    }
    if (!(msg.channel.id === cfg.organiser_channel)) return;

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

    args.startDelay = args.startDelay ? args.startDelay : 0;
    const startTime = moment().utc().add(args.startDelay, "ms");

    const isInFarFuture = moment().utc().add(1, "hour") < startTime;

    const everyoneDeny = isInFarFuture ? 1049600 : 1048576;

    let voiceChan;
    try {
      voiceChan = await pluginData.guild.createChannel(
        "" + ((await pluginData.state.guildEvents.highestEventId()) + 1),
        2,
        "Create event vocie channel",
        {
          parentID: cfg.voice_parent_id,
          permissionOverwrites: [
            { type: "role", id: pluginData.guild.id, allow: 0, deny: everyoneDeny },
            { type: "role", id: cfg.organiser_role, allow: 1049600, deny: 0 },
            { type: "member", id: pluginData.client.user.id, allow: 269544528, deny: 0 },
          ],
        },
      );
    } catch (e) {
      sendErrorMessage(msg.channel, `Error, we might be missing permissions! E: ${e}`);
      return;
    }

    const announceMsg = await announceChan.createMessage({ embed });
    announceMsg.addReaction("👍");

    pluginData.state.guildEvents.add(
      msg.author.id,
      voiceChan.id,
      announceMsg.id,
      args.title,
      args.description,
      args.acceptInfo,
      startTime.valueOf(),
      true,
      true,
      !isInFarFuture,
    );

    sendSuccessMessage(
      msg.channel,
      `Event \`${args.title}\` created and posted! \nThe event starts at ${startTime.format(
        "DD-MM-YYYY HH:mm",
      )} UTC.\nThe voice channel will be made visible to everyone an hour in advance.`,
    );
    logger.info(
      `User ${msg.author.id} created event ${await pluginData.state.guildEvents.highestEventId()} | Announce Msg: ${
        announceMsg.id
      } | Voice Chan: ${voiceChan.id}`,
    );
  },
});
