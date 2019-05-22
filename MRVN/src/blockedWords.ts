import { logger } from "knub";
import { isNullOrUndefined } from "util";

const blockedRegex = ["f[a@]gg[o0]t", "ch[i1l]nk", "n[il1](gg|bb)(er|a|@)?", "r[e3]t[a4@]rd"];

export function passesFilter(message: string) {

    for (let index = 0; index < blockedRegex.length; index++) {
        const element = blockedRegex[index];
        
        const filter = new RegExp(element, "i");
        if (!isNullOrUndefined(message.match(filter))) {
            return false;
        }

    }

    return true;
}