import { PluginData } from "knub";
import { ApexEventsPluginType, TAsk } from "../types";

export function getAskForAskMessageId(pluginData: PluginData<ApexEventsPluginType>, askMsgId: string): TAsk {
  return pluginData.state.asks.find((x) => x.message_id === askMsgId);
}
