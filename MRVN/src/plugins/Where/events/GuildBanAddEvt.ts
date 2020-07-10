import { whereEvent } from "../types";
import { removeNotifyforUserId } from "../utils/removeNotifyForUserId";


export const GuildBanAddEvt = whereEvent({
    event: "guildBanAdd",

    async listener(meta) {
        removeNotifyforUserId(meta.pluginData, meta.args.user.id);
    },
});