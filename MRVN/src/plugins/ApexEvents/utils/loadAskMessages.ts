import fs from "fs";
import { PluginData } from "knub";
import { ApexEventsPluginType, TEvent, TAsk } from "../types";

export async function loadAskMessages(pluginData: PluginData<ApexEventsPluginType>) {
  if (!fs.existsSync(`./events/${pluginData.guild.id}-asks.MRVN`)) return;

  pluginData.state.asks = JSON.parse(fs.readFileSync(`./events/${pluginData.guild.id}-asks.MRVN`).toString()) as TAsk[];
}
