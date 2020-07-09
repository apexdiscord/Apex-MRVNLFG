import { performance } from "perf_hooks";
import { PluginData } from "knub";
import { LfgPluginType } from "../types";

export async function updateDelayTime(pluginData: PluginData<LfgPluginType>, start: any): Promise <void> {
    pluginData.state.delay[pluginData.state.current_pos] = performance.now() - start;
    pluginData.state.current_pos++;
    if (pluginData.state.current_pos >= 5) {
        pluginData.state.current_pos = 0;
    }
}