import { Client, Guild, Member, User } from "eris";
import { logger } from "./logger";

const delayStringMultipliers: any = {
  w: 1000 * 60 * 60 * 24 * 7,
  d: 1000 * 60 * 60 * 24,
  h: 1000 * 60 * 60,
  m: 1000 * 60,
  s: 1000,
};

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
  public id: string = null;
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

export async function resolveMember(bot: Client, guild: Guild, value: string): Promise<Member> {
  // start by resolving the user
  const user: User | UnknownUser = await resolveUser(bot, value);
  if (!user || user instanceof UnknownUser) {
    return null;
  }

  // see if we have the member cached...
  let member: Member = guild.members.get(user.id);

  // we only fetch the member from the API if we haven't tried it before:
  // - If the member was found, the bot has them in the guild's member cache
  // - If the member was not found, they'll be in unknownMembers
  const unknownKey: string = `${guild.id}-${user.id}`;
  if (!unknownMembers.has(unknownKey)) {
    // if not, fetch it from the API
    if (!member) {
      try {
        logger.debug(`Fetching unknown member (${user.id} in ${guild.name} (${guild.id})) from the API`);

        member = await bot.getRESTGuildMember(guild.id, user.id);
        member.id = user.id;
        member.guild = guild;
      } catch (e) {} // eslint-disable-line
    }

    if (!member) {
      unknownMembers.add(unknownKey);
    }
  }

  return member;
}

export async function resolveUser(bot: Client, value: string): Promise<User | UnknownUser> {
  if (value == null || typeof value !== "string") {
    return new UnknownUser();
  }

  let userId: any;

  // a user mention?
  const mentionMatch: RegExpMatchArray = value.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    userId = mentionMatch[1];
  }

  // a non-mention, full username?
  if (!userId) {
    const usernameMatch: RegExpMatchArray = value.match(/^@?([^#]+)#(\d{4})$/);
    if (usernameMatch) {
      const user: User = bot.users.find((u) => u.username === usernameMatch[1] && u.discriminator === usernameMatch[2]);
      if (user) {
        userId = user.id;
      }
    }
  }

  // just a user ID?
  if (!userId) {
    const idMatch: RegExpMatchArray = value.match(/^\d+$/);
    if (!idMatch) {
      return null;
    }

    userId = value;
  }

  const cachedUser: User = bot.users.find((u) => u.id === userId);
  if (cachedUser) {
    return cachedUser;
  }

  // we only fetch the user from the API if we haven't tried it before:
  // - If the user was found, the bot has them in its cache
  // - If the user was not found, they'll be in unknownUsers
  if (!unknownUsers.has(userId)) {
    try {
      const freshUser: User = await bot.getRESTUser(userId);
      bot.users.add(freshUser, bot);
      return freshUser;
    } catch (e) {} // eslint-disable-line

    unknownUsers.add(userId);
  }

  return new UnknownUser({ id: userId });
}

export function convertDelayStringToMS(str: string, defaultUnit: string = "m"): number {
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
