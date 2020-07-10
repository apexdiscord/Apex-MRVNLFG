import { PluginOptions, plugin } from "knub";
import { UtilityPluginType } from "./types";
import { updateLoop } from "./utils/updateLoop";
import { PingCmd } from "./commands/PingCmd";
import { LevelCmd } from "./commands/LevelCmd";
import { UptimeCmd } from "./commands/UptimeCmd";
import { VersionCmd } from "./commands/VersionCmd";
import { DmMessageCreateEvt } from "./events/DmMessageCreateEvt";

const defaultOptions: PluginOptions<UtilityPluginType> = {
    config: {
        can_ping: false,
        can_level: false,
        can_uptime: false,
        can_version: false,

        dm_response: "Sorry, but you can only control this bot through commands within the server!",
    },
    overrides: [
        {
            level: ">=1",
            config: {
                can_level: true,
            },
        },
        {
            level: ">=50",
            config: {
                can_ping: true,
                can_uptime: true,
                can_version: true,
            },
        },
    ],
};

export const UtilityPlugin = plugin<UtilityPluginType>()("utility", {
    defaultOptions,

    // prettier-ignore
    commands: [
        PingCmd,
        LevelCmd,
        UptimeCmd,
        VersionCmd,
    ],

    // prettier-ignore
    events: [
        DmMessageCreateEvt,
    ],

    onLoad(pluginData) {
        const { state } = pluginData;

        state.VERSION = "1.0.5";
        state.NEWEST_VERSION = state.VERSION;
        state.NEW_AVAILABLE = false;

        state.unloaded = false;
        state.updateTimeout = null;

        updateLoop(pluginData);
    },

    onUnload(pluginData) {
        pluginData.state.unloaded = true;
    }
});