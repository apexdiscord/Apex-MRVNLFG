import fs from "fs";
import path from "path";
import { isNullOrUndefined } from "util";
import yaml from "js-yaml";
const fsp = fs.promises;

let blockedRegex: string[] = ["f[a@]gg[o0]t", "ch[i1l]nk", "n[il1](gg|bb)(er|a|@)?", "r[e3]t[a4@]rd"];

export function passesFilter(message: string): boolean {
  for (const element of blockedRegex) {
    const filter: RegExp = new RegExp(element, "i");
    if (!isNullOrUndefined(message.match(filter))) {
      return false;
    }
  }

  return true;
}

export async function loadRegex(): Promise<void> {
  const blockedPath: string = path.join("config", "blocked.yml");

  try {
    await fsp.access(blockedPath);
  } catch (e) {
    return;
  }

  const yamlString: string = await fsp.readFile(blockedPath, {
    encoding: "utf8",
  });
  blockedRegex = yaml.safeLoad(yamlString);
}
