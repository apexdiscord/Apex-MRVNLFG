import { PluginData } from "knub";
import { Collection, AnyGuildChannel, VoiceChannel, CategoryChannel } from "eris";
import { ScalingPluginType } from "../types";

export async function doAutomaticScaling(pluginData: PluginData<ScalingPluginType>) {
  const cfg = pluginData.config.get();
  const manualUnhides = await pluginData.state.scalingUnhides.getAllScalingUnhides();
  let allScalingCategories = (await pluginData.state.scalingCategories.getAllScalingCategories()).sort(
    (a, b) => a.id - b.id,
  );

  const channels: Collection<AnyGuildChannel> = pluginData.guild.channels;
  const channelMap: Map<AnyGuildChannel, string> = new Map();
  const categories: CategoryChannel[] = [];
  const hiddenCats: string[] = [];
  const catUsagePct: Map<string, number> = new Map();

  const pendingHides = [];
  let pendingUnhide: CategoryChannel = null;

  channels.forEach((ch) => {
    if (ChannelType[ch.type] === "VoiceChannel") {
      channelMap.set(ch, ch.parentID);
    } else if (ChannelType[ch.type] === "Category") {
      if (
        allScalingCategories.find((x) => x.category_id === ch.id) != null &&
        manualUnhides.find((x) => x.category_id === ch.id) == null
      ) {
        categories.push(ch as CategoryChannel);

        const everyonePerm = ch.permissionOverwrites.find((x) => x.id === pluginData.guild.id);
        if ((everyonePerm.deny & pluginData.state.hidePermission) > 0) {
          hiddenCats.push(ch.id);
        }
      }
    }
  });

  for (const cat of categories) {
    const catChannels: AnyGuildChannel[] = [...channelMap.entries()]
      .filter(({ 1: id }) => id === cat.id)
      .map(([k]) => k);
    if (catChannels.length === 0) {
      continue;
    }

    let usedAmt: number = 0;
    catChannels.forEach((ch) => {
      const vc: VoiceChannel = pluginData.client.getChannel(ch.id) as VoiceChannel;
      if (vc.voiceMembers.size !== 0) {
        usedAmt++;
      }
    });

    const pct = (usedAmt / catChannels.length) * 100;
    catUsagePct.set(cat.id, pct);
  }

  if (categories.length <= 1) return;
  for (let i = 1; i < allScalingCategories.length; i++) {
    const previous = allScalingCategories[i - 1];
    const previousPct = catUsagePct.get(previous.category_id);
    const current = allScalingCategories[i];

    if (hiddenCats.includes(current.category_id)) {
      // We are hidden, check if we need to be unhidden
      if (previousPct >= cfg.automatic_unhide_percentage) {
        pendingUnhide = pluginData.client.getChannel(current.category_id) as CategoryChannel;
        break;
      }
    }
  }

  if (pendingUnhide != null) {
    const everyonePerm = pendingUnhide.permissionOverwrites.find((x) => x.id === pluginData.guild.id);
    if ((everyonePerm.allow & pluginData.state.hidePermission) <= 0) {
      if ((everyonePerm.deny & pluginData.state.hidePermission) > 0) {
        await pendingUnhide.editPermission(
          pluginData.guild.id,
          everyonePerm.allow + pluginData.state.hidePermission,
          everyonePerm.deny - pluginData.state.hidePermission,
          "role",
        );
      } else {
        await pendingUnhide.editPermission(
          pluginData.guild.id,
          everyonePerm.allow + pluginData.state.hidePermission,
          everyonePerm.deny,
          "role",
        );
      }
    }

    hiddenCats.splice(hiddenCats.indexOf(pendingUnhide.id), 1);
    pendingUnhide = null;
  }

  allScalingCategories = allScalingCategories.reverse();

  for (let i = 0; i < allScalingCategories.length - 1; i++) {
    const current = allScalingCategories[i];
    const next = allScalingCategories[i + 1];

    if (hiddenCats.includes(current.category_id)) continue;
    if (catUsagePct.get(current.category_id) > 0) break;
    if (catUsagePct.get(next.category_id) >= cfg.automatic_unhide_percentage) break;

    pendingHides.push(pluginData.client.getChannel(current.category_id) as CategoryChannel);
  }

  pendingHides.forEach(async (pend) => {
    const everyonePerm = pend.permissionOverwrites.find((x) => x.id === pluginData.guild.id);
    if ((everyonePerm.deny & pluginData.state.hidePermission) <= 0) {
      if ((everyonePerm.allow & pluginData.state.hidePermission) > 0) {
        await pend.editPermission(
          pluginData.guild.id,
          everyonePerm.allow - pluginData.state.hidePermission,
          everyonePerm.deny + pluginData.state.hidePermission,
          "role",
        );
      } else {
        await pend.editPermission(
          pluginData.guild.id,
          everyonePerm.allow,
          everyonePerm.deny + pluginData.state.hidePermission,
          "role",
        );
      }
    }
  });
}

export enum ChannelType {
  TextChannel = 0,
  // eslint-disable-next-line no-shadow
  VoiceChannel = 2,
  Category = 4,
}
