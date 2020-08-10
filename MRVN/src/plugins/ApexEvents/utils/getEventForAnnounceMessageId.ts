import { PluginData } from "knub";
import { ApexEventsPluginType, TEvent } from "../types";

export function getEventForAnnounceMessageId(
  pluginData: PluginData<ApexEventsPluginType>,
  announceMsgId: string,
): TEvent {
  return pluginData.state.events.find((evt) => evt.announce_message_id === announceMsgId);
}
