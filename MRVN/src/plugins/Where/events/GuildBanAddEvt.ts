import { whereEvent } from "../types";

export const GuildBanAddEvt = whereEvent({
  event: "guildBanAdd",

  async listener(meta) {
    meta.pluginData.state.notifyRequests.removeAllUserNotifiesForUserId(meta.args.user.id);
  },
});
