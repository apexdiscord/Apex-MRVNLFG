import { lfgEvent } from "../types";

export const MessageCreateEvt = lfgEvent({
  event: "channelDelete",

  async listener(meta) {
    if (meta.args.channel.type !== 4) return;
    meta.pluginData.state.categories.remove(meta.args.channel.id);
  },
});
