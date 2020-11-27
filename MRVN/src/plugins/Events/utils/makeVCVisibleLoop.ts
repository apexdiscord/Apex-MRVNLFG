import { GuildPluginData } from "knub";
import moment from "moment-timezone";
import { GuildTextableChannel, VoiceChannel } from "eris";
import { EventsPluginType } from "../types";
import { logger } from "../../../logger";

const VC_VISIBLE_TIMEOUT = 30 * 1000;

export async function makeVCVisibleLoop(pluginData: GuildPluginData<EventsPluginType>) {
  const activeEvents = await pluginData.state.guildEvents.getAll(true);

  for (const evt of activeEvents) {
    if (evt.vc_visible) return;
    if (evt.startTime > moment().utc().add(1, "hour").valueOf()) return;

    const vc = pluginData.guild.channels.get(evt.voice_id) as VoiceChannel;
    vc.editPermission(pluginData.guild.id, 512, 1048576, "role", "Event starts in 1 hour, making visible");
    pluginData.state.guildEvents.markVcPublic(evt.id);

    const pingRole = pluginData.config.get().ping_role;
    if (pingRole !== "") {
      const announceChan = pluginData.client.getChannel(
        pluginData.config.get().events_announce_channel,
      ) as GuildTextableChannel;

      const pingMsg = await announceChan.createMessage(
        `<@&${pingRole}> | The event \`${evt.title}\` is starting in one hour!`,
      );
      await pluginData.state.guildEvents.setPingMsgId(evt.id, pingMsg.id);
    }

    logger.info(`Voice channel ${vc.id} for Event ${evt.id} made visible because the event starts in 1 hour`);
  }

  if (!pluginData.state.unloaded) {
    pluginData.state.makeVCVisibleTimeout = setTimeout(() => makeVCVisibleLoop(pluginData), VC_VISIBLE_TIMEOUT);
  }
}
