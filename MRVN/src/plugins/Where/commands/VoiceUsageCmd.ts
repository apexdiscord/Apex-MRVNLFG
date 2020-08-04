import { AnyGuildChannel, Collection, VoiceChannel } from "eris";
import { whereCommand } from "../types";
import { logger } from "../../../logger";
import { ChannelType } from "../utils/ChannelType";

export const VoiceUsageCmd = whereCommand({
  trigger: ["voice_usage", "voiceusage", "vu"],
  permission: "can_usage",
  source: "guild",
  cooldown: 10 * 1000,

  async run({ message: msg, pluginData }) {
    const channels: Collection<AnyGuildChannel> = pluginData.guild.channels;
    const channelMap: Map<AnyGuildChannel, string> = new Map();
    const categories: AnyGuildChannel[] = [];

    channels.forEach((ch) => {
      if (ChannelType[ch.type] === "VoiceChannel") {
        channelMap.set(ch, ch.parentID);
      } else if (ChannelType[ch.type] === "Category") {
        categories.push(ch);
      }
    });
    const col: Intl.Collator = new Intl.Collator(undefined, { numeric: true, sensitivity: `base` });
    categories.sort((a, b) => col.compare(a.name, b.name));

    let reply: string = "Channel usage:";

    for (const cat of categories) {
      const catChannels: AnyGuildChannel[] = [...channelMap.entries()]
        .filter(({ 1: id }) => id === cat.id)
        .map(([k]) => k);
      if (catChannels.length === 0) {
        continue;
      }

      let freeAmt: number = 0;
      catChannels.forEach((ch) => {
        const vc: VoiceChannel = pluginData.client.getChannel(ch.id) as VoiceChannel;
        if (vc.voiceMembers.size === 0) {
          freeAmt++;
        }
      });

      reply += `\n__${cat.name}__: **${freeAmt}** of **${catChannels.length}** free`;
    }

    msg.channel.createMessage(reply);

    logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested current VC usage`);
  },
});
