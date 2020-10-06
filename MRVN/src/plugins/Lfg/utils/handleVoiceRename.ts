import { GuildPluginData } from "knub";
import { Message, VoiceChannel, GuildChannel } from "eris";
import { LfgPluginType } from "../types";

export async function handleVoiceRename(
  pluginData: GuildPluginData<LfgPluginType>,
  msg: Message,
  text: GuildChannel,
  voice: VoiceChannel,
) {
  const cat = await pluginData.state.categories.getRankedCategory(text.parentID);
  const isRanked = cat ? true : false;
}
