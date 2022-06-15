import { GuildPluginData } from "knub";
import { LfgPluginType } from "../types";

export async function incrementOrCreateCounter(targetId: string, pluginData: GuildPluginData<LfgPluginType>) {
  const targetCounter = await pluginData.state.kickBlockCounter.find(targetId);

  if (targetCounter) {
    const count = targetCounter.count + 1;
    await pluginData.state.kickBlockCounter.set(targetId, count);

    if (count >= 5) {
      pluginData.state.alertText.send({
        content: `<@${targetId}> has been kicked or blocked ${count} times without 24 hours of no kicks/blocks.`,
        allowedMentions: { users: [] },
      });
    }
  } else {
    await pluginData.state.kickBlockCounter.set(targetId, 1);
  }
}

const COUNTER_CLEANUP_LOOP_INTERVAL = 15 * 60 * 1000;

export async function runKickBlockCounterCleanupLoop(pluginData: GuildPluginData<LfgPluginType>) {
  await pluginData.state.kickBlockCounter.deleteOld();

  setTimeout(() => runKickBlockCounterCleanupLoop(pluginData), COUNTER_CLEANUP_LOOP_INTERVAL);
}
