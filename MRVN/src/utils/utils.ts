import * as t from "io-ts";

const delayStringMultipliers: any = {
  w: 1000 * 60 * 60 * 24 * 7,
  d: 1000 * 60 * 60 * 24,
  h: 1000 * 60 * 60,
  m: 1000 * 60,
  s: 1000,
};

export const MS = 1;
export const SECONDS = 1000 * MS;
export const MINUTES = 60 * SECONDS;
export const HOURS = 60 * MINUTES;
export const DAYS = 24 * HOURS;
export const WEEKS = 7 * 24 * HOURS;

export function successMessage(str: string): string {
  return `👍 ${str}`;
}

export function errorMessage(str: string): string {
  return `⚠ ${str}`;
}

export function trimLines(str: string): string {
  return str
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

let start: any = 0;

export function startUptimeCount(): void {
  start = Date.now();
}

export function getUptime(): any {
  return Date.now() - start;
}

// if you dont like Dragorys Code, dont read this :Eyes:
export class UnknownUser {
  public id: string = "";
  public username = "Unknown";
  public discriminator = "0000";

  constructor(props: any = {}) {
    for (const key in props) {
      this[key] = props[key];
    }
  }
}

const unknownUsers: Set<any> = new Set();
const unknownMembers: Set<any> = new Set();

export function disableCodeBlocks(content: string): string {
  return content.replace(/`/g, "`\u200b");
}

export function convertDelayStringToMS(str: string, defaultUnit: string = "m"): number | null {
  const regex: RegExp = /^([0-9]+)\s*([wdhms])?[a-z]*\s*/;
  let match: any;
  let ms: any = 0;

  str = str.trim();

  while (str !== "" && (match = str.match(regex)) !== null) {
    ms += match[1] * ((match[2] && delayStringMultipliers[match[2]]) || delayStringMultipliers[defaultUnit]);
    str = str.slice(match[0].length);
  }

  // invalid delay string
  if (str !== "") {
    return null;
  }

  return ms;
}

export function tNullable<T extends t.Type<any, any>>(type: T) {
  return t.union([type, t.undefined, t.null], `Nullable<${type.name}>`);
}
