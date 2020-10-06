import { GuildChannel, Message, VoiceChannel } from "eris";
import { GuildPluginData } from "knub";
import { noop } from "knub/dist/utils";
import moment from "moment-timezone";
import humanizeDuration from "humanize-duration";
import { logger } from "../../../logger";
import { LfgPluginType } from "../types";

export async function renameChannel(
  voice: VoiceChannel,
  userMessage: Message,
  pluginData: GuildPluginData<LfgPluginType>,
): Promise<string> {
  if (pluginData.state.rename_cooldowns.get(voice.id) > moment.utc().valueOf()) {
    return `\nChannel cannot be renamed for ${humanizeDuration(
      pluginData.state.rename_cooldowns.get(voice.id) - moment.utc().valueOf(),
    )}`;
  }

  if (
    voice.parentID !== "762813514154639360" &&
    voice.parentID !== "762813602901000202" &&
    voice.parentID !== "762813628155691028"
  ) {
    return "";
  }
  const startTime = moment().utc().toISOString();

  const textChannel = userMessage.channel as GuildChannel;
  let catIdent: LfgRegion;
  switch (textChannel.parentID) {
    case "746154922109698129": // NA
      catIdent = LfgRegion.NA;
      break;

    case "551767166395875332": // EU
      catIdent = LfgRegion.EU;
      break;

    case "542415712229130297": // OCE
      catIdent = LfgRegion.OCE;
      break;

    case "543049006427668500": // ASIA
      catIdent = LfgRegion.ASIA;
      break;

    case "543053590756065300": // LATAM
      catIdent = LfgRegion.LATAM;
      break;

    default:
      return "";
  }

  const voiceNum = voice.name.match(/\d+/)[0];
  const newName = `[${LfgRegion[catIdent]}] Voice Channel ${voiceNum}`;
  await voice.edit({ name: newName }).catch(noop);
  pluginData.state.rename_cooldowns.set(voice.id, moment.utc().valueOf() + 600000);
  logger.info(`Renamed VC ${voice.id}, started at [${startTime}]`);
  return "";
}

export enum LfgRegion {
  NA = 1,
  EU = 2,
  OCE = 3,
  ASIA = 4,
  LATAM = 5,
}
