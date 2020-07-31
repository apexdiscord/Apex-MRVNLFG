import { utilityCommand } from "../types";

export const VersionCmd = utilityCommand({
    trigger: "version",
    permission: "can_version",
    cooldown: 5 * 1000,

    async run({ message: msg, pluginData }) {
        let reply: string;

        // eslint-disable-next-line @typescript-eslint/tslint/config
        if (pluginData.state.NEW_AVAILABLE) {
            reply = `New bot version available!\nCurrent bot version: **${pluginData.state.VERSION}**\nLatest version: **${pluginData.state.NEWEST_VERSION}**`;
        } else {
            reply = `You have the newest bot version! Version: **${pluginData.state.VERSION}**`;
        }

        msg.channel.createMessage(reply);
    }
});