import { utilityCommand } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { Member } from "eris";
import { getMemberLevel } from "knub/dist/helpers";
import { logger } from "../../../logger";

export const LevelCmd = utilityCommand({
    trigger: "level",
    permission: "can_level",

    signature: {
        member: ct.resolvedMember({required: false}),
    },

    async run({ message: msg, args, pluginData }) {
        const member: Member = args.member || msg.member;
        const level: any = getMemberLevel(pluginData, member);
        msg.channel.createMessage(`The permission level of ${member.username}#${member.discriminator} is **${level}**`);

        logger.info(
            `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested ${member.id}'s user level (${level})`,
        );
    }
});