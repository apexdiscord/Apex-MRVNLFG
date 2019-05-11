import { decorators as d, IPluginOptions, Plugin } from "knub";
import { Message, Member } from "eris";
import { noop } from "knub/dist/utils";
import { trimLines, getUptime } from "../utils";
import { performance } from "perf_hooks";
import humanizeDuration from "humanize-duration";
import { isNullOrUndefined } from "util";

interface IBlockedPluginConfig {
    blocked_regex: string[];
}

export class UtilityPlugin extends Plugin<IBlockedPluginConfig> {
    public static pluginName = "blocked";

    getDefaultOptions(): IPluginOptions<IBlockedPluginConfig> {
        return {
            config: {
                blocked_regex: ["f[a@]gg[o0]t", "ch[i1l]nk", "n[il1](gg|bb)(er|a|@)?", "r[e3]t[a4@]rd"],
            },
        };
    }

}

export function checkForBlockedWords(msg: string) {
    let found = false;
    this.getConfig().blocked_regex.forEach(regex => {
        let check = new RegExp(`^([^ß]|[ß])* ${regex} ([^ß]|[ß])*$`, "i");
        if (!isNullOrUndefined(msg.match(check))) {
            found = true;
        }
    });
    return found;
}