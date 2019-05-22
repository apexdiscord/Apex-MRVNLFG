import { Client, Guild, Member, User } from "eris";
import { logger } from "knub";

export function successMessage(str) {
    return `🛠 ${str}`;
}

export function errorMessage(str) {
    return `⚠ ${str}`;
}

export function trimLines(str: string) {
    return str
        .trim()
        .split("\n")
        .map(l => l.trim())
        .join("\n")
        .trim();
}

let start = 0;

export function startUptimeCount() {
    start = Date.now();
}

export function getUptime() {
    return Date.now() - start;
}

//If you dont like Dragorys Code, dont read this :Eyes:
export class UnknownUser {
    public id: string = null;
    public username = "Unknown";
    public discriminator = "0000";

    constructor(props = {}) {
        for (const key in props) {
            this[key] = props[key];
        }
    }
}

const unknownUsers = new Set();
const unknownMembers = new Set();

export function disableCodeBlocks(content: string): string {
    return content.replace(/`/g, "`\u200b");
}

export async function resolveMember(bot: Client, guild: Guild, value: string): Promise<Member> {
    // Start by resolving the user
    const user = await resolveUser(bot, value);
    if (!user || user instanceof UnknownUser) return null;

    // See if we have the member cached...
    let member = guild.members.get(user.id);

    // We only fetch the member from the API if we haven't tried it before:
    // - If the member was found, the bot has them in the guild's member cache
    // - If the member was not found, they'll be in unknownMembers
    const unknownKey = `${guild.id}-${user.id}`;
    if (!unknownMembers.has(unknownKey)) {
        // If not, fetch it from the API
        if (!member) {
            try {
                logger.debug(`Fetching unknown member (${user.id} in ${guild.name} (${guild.id})) from the API`);

                member = await bot.getRESTGuildMember(guild.id, user.id);
                member.id = user.id;
                member.guild = guild;
            } catch (e) { } // tslint:disable-line
        }

        if (!member) unknownMembers.add(unknownKey);
    }

    return member;
}

export async function resolveUser(bot: Client, value: string): Promise<User | UnknownUser> {
    if (value == null || typeof value !== "string") {
        return new UnknownUser();
    }

    let userId;

    // A user mention?
    const mentionMatch = value.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
        userId = mentionMatch[1];
    }

    // A non-mention, full username?
    if (!userId) {
        const usernameMatch = value.match(/^@?([^#]+)#(\d{4})$/);
        if (usernameMatch) {
            const user = bot.users.find(u => u.username === usernameMatch[1] && u.discriminator === usernameMatch[2]);
            if (user) userId = user.id;
        }
    }

    // Just a user ID?
    if (!userId) {
        const idMatch = value.match(/^\d+$/);
        if (!idMatch) {
            return null;
        }

        userId = value;
    }

    const cachedUser = bot.users.find(u => u.id === userId);
    if (cachedUser) return cachedUser;

    // We only fetch the user from the API if we haven't tried it before:
    // - If the user was found, the bot has them in its cache
    // - If the user was not found, they'll be in unknownUsers
    if (!unknownUsers.has(userId)) {
        try {
            const freshUser = await bot.getRESTUser(userId);
            bot.users.add(freshUser, bot);
            return freshUser;
        } catch (e) { } // tslint:disable-line

        unknownUsers.add(userId);
    }

    return new UnknownUser({ id: userId });
}