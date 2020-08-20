import { PluginData } from "knub";
import moment from "moment-timezone";
import { VoiceChannel } from "eris";
import { EventsPluginType } from "../types";
import { logger } from "../../../logger";

const VC_VISIBLE_TIMEOUT = 30 * 1000;

export async function makeVCVisibleLoop(pluginData: PluginData<EventsPluginType>) {
  const activeEvents = await pluginData.state.guildEvents.getAll(true);

  activeEvents.forEach((evt) => {
    if (evt.vc_visible) return;
    if (evt.startTime > moment().utc().add(1, "hour").valueOf()) return;

    const vc = pluginData.guild.channels.get(evt.voice_id) as VoiceChannel;
    vc.editPermission(pluginData.guild.id, 0, 1048576, "role", "Event starts in 1 hour, making visible");
    pluginData.state.guildEvents.markVcPublic(evt.id);

    logger.info(`Voice channel ${vc.id} for Event ${evt.id} made visible because the event starts in 1 hour`);
  });

  if (!pluginData.state.unloaded) {
    pluginData.state.makeVCVisibleTimeout = setTimeout(() => makeVCVisibleLoop(pluginData), VC_VISIBLE_TIMEOUT);
  }
}
