import { PluginData } from "knub";
import moment from "moment-timezone";
import { ScalingPluginType } from "../types";
import { doAutomaticScaling } from "./doAutomaticScaling";

const AUTO_SCALING_TIMEOUT = 45 * 1000;

export async function automaticScalingCheckLoop(pluginData: PluginData<ScalingPluginType>) {
  const allUnhides = await pluginData.state.scalingUnhides.getAllScalingUnhides();
  for (const unhide of allUnhides) {
    if (unhide.minimum_until <= moment().utc().valueOf()) {
      pluginData.state.scalingUnhides.remove(unhide.id);
    }
  }

  if (pluginData.config.get().automatic) {
    doAutomaticScaling(pluginData);
  }

  if (!pluginData.state.unloaded) {
    pluginData.state.autoScalingCheckTimeout = setTimeout(
      () => automaticScalingCheckLoop(pluginData),
      AUTO_SCALING_TIMEOUT,
    );
  }
}
