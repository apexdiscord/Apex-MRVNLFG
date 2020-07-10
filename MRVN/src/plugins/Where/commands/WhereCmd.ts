import { commandTypeHelpers as ct } from "../../../commandTypes";
import { Member } from "eris";
import { logger } from "knub";
import { whereCommand } from "../types";
import { UnknownUser, resolveMember } from "../../../utils";
import { sendErrorMessage } from "../../../pluginUtils";
import { sendWhere } from "../utils/sendWhere";

export const WhereCmd = whereCommand({
    trigger: ["where", "w"],
    permission: "can_where",

    signature: {
        user: ct.resolvedUserLoose({ required: true }),
    },

    async run({ message: msg, args, pluginData }) {
        let member: Member;
        if (!(args.user instanceof UnknownUser)) {
            member = await resolveMember(pluginData.client, pluginData.guild, args.user.id);
            try {
                member = await pluginData.client.getRESTGuildMember(pluginData.guild.id, args.user.id);
            } catch (err) {
                logger.error(err);
            }
        } else {
            sendErrorMessage(msg.channel, "Unknown user/member! Is the ID correct?");
            return;
        }

        let newVer: string = "";

        // TODO: Cross-plugin action
        // if (UtilityPlugin.NEW_AVAILABLE && this.getConfig().update_notification) {
        //     newVer = `⚙️ New bot version available! Version **${UtilityPlugin.NEWEST_VERSION}**\n`;
        // }

        sendWhere(pluginData.guild, member, msg.channel, newVer + msg.author.mention + " ");

        logger.info(
            `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested where for ${member.id}`,
        );
    }
});