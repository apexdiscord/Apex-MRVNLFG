import {
    disableCodeBlocks,
    resolveMember,
    resolveUser,
} from "./utils";
import { CommandArgumentTypeError } from "knub";
import { Client, GuildChannel, Message } from "eris";

export const customArgumentTypes = {

    async resolvedMember(value, msg: Message, bot: Client) {
        if (!(msg.channel instanceof GuildChannel)) return null;

        const result = await resolveMember(bot, msg.channel.guild, value);
        if (result == null) {
            throw new CommandArgumentTypeError(
                `Member \`${disableCodeBlocks(value)}\` was not found or they have left the server`,
            );
        }
        return result;
    },

    async resolvedUserLoose(value, msg, bot: Client) {
        const result = await resolveUser(bot, value);
        if (result == null) {
            throw new CommandArgumentTypeError(`Invalid user: \`${disableCodeBlocks(value)}\``);
        }
        return result;
    },

};
