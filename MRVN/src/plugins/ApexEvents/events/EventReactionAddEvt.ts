import { Message, TextableChannel, EmbedOptions, VoiceChannel, User } from "eris";
import moment from "moment-timezone";
import humanizeDuration from "humanize-duration";
import { apexEventsEvent, TEvent, TAsk } from "../types";
import { getEventForAnnounceMessageId } from "../utils/getEventForAnnounceMessageId";
import { resolveMember, resolveUser } from "../../../utils";
import { getAskForAskMessageId } from "../utils/getEventForAskMessageId";
import { saveAskMessages } from "../utils/saveAskMessages";

export const EventReactionAddEvt = apexEventsEvent({
  event: "messageReactionAdd",

  async listener(meta) {
    const pluginData = meta.pluginData;
    const cfg = pluginData.config.get();
    const msg = meta.args.message as Message;
    const emoji = meta.args.emoji;
    const reactor = await resolveMember(pluginData.client, pluginData.guild, meta.args.userID);

    if (emoji.name !== "👍" && emoji.name !== "👎") return;
    if (msg.channel.id === cfg.events_announce_channel) {
      const event: TEvent = getEventForAnnounceMessageId(pluginData, msg.id);
      if (!event) return;

      const ask = pluginData.state.asks.find((x) => x.event_id === event.event_id && x.asker_id === reactor.id);
      if (ask) return;

      const organizerChan = pluginData.guild.channels.get(cfg.organizer_channel) as TextableChannel;

      const embed: EmbedOptions = {
        fields: [],
      };
      embed.author = { name: reactor.username, icon_url: reactor.avatarURL };
      embed.title = `A user wants to join this event:`;
      embed.description = `Event Name: **${event.event_title}**\nEvent by: <@${event.author_id}>`;
      embed.fields.push({
        name: "Account Age:",
        value: humanizeDuration(moment().valueOf() - reactor.createdAt, {
          largest: 2,
          round: true,
        }),
        inline: true,
      });
      embed.fields.push({
        name: "Joined at:",
        value: humanizeDuration(moment().valueOf() - reactor.joinedAt, {
          largest: 2,
          round: true,
        }),
        inline: true,
      });
      embed.color = 0xe9ed07;

      const askMsg = await organizerChan.createMessage({ embed });
      askMsg.addReaction("👍");
      askMsg.addReaction("👎");

      pluginData.state.asks.push({
        asker_id: reactor.id,
        event_id: event.event_id,
        message_id: askMsg.id,
      });
      saveAskMessages(pluginData);
    } else if (msg.channel.id === cfg.organizer_channel) {
      const ask: TAsk = getAskForAskMessageId(pluginData, msg.id);
      if (!ask) return;

      const evt = pluginData.state.events.find((x) => x.event_id === ask.event_id);
      if (!evt) return;

      const usr = (await resolveUser(pluginData.client, ask.asker_id)) as User;
      let embed: EmbedOptions = {
        fields: [],
      };

      if (emoji.name === "👎") {
        embed = {
          fields: [],
        };
        embed.author = { name: usr.username, icon_url: usr.avatarURL };
        embed.title = `User was denied from this event by ${reactor.username}#${reactor.discriminator}:`;
        embed.description = `Event Name: **${evt.event_title}**\nEvent by: <@${evt.author_id}>`;
        embed.color = 0xf02f22;
        await msg.removeReactions();
        await msg.edit({ embed });
        return;
      }

      const vc = pluginData.guild.channels.get(evt.voice_channel_id) as VoiceChannel;
      await vc.editPermission(ask.asker_id, 1024, 0, "member");

      embed.author = { name: reactor.username, icon_url: reactor.avatarURL };
      embed.title = `You have been accepted to the event \`${evt.event_title}\`!`;
      embed.description =
        evt.event_description + `\n\nPlease be in the voice channel named \`${evt.event_id}\` at the specified time!`;
      embed.color = 0x16d94d;
      (await usr.getDMChannel()).createMessage({ embed });

      await msg.removeReactions();
      embed = {
        fields: [],
      };
      embed.author = { name: usr.username, icon_url: usr.avatarURL };
      embed.title = `User was accepted to this event by ${reactor.username}#${reactor.discriminator}:`;
      embed.description = `Event Name: **${evt.event_title}**\nEvent by: <@${evt.author_id}>`;
      embed.color = 0x16d94d;
      await msg.edit({ embed });
    }
  },
});
