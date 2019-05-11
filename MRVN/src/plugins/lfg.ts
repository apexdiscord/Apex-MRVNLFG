import Knub, { decorators as d, IPluginOptions, getInviteLink, Plugin, logger } from "knub";
import { Message, VoiceChannel, TextChannel, User } from "eris";
import { isNullOrUndefined } from "util";
import { performance } from "perf_hooks";
import { trimLines } from "../utils";
import { checkForBlockedWords } from "./blocked";

interface ILfgPluginConfig {
    lfg_command_ident: string;
    lfg_voice_ident: string;
    lfg_text_ident: string;
    lfg_message_compact: boolean;
    lfg_list_others: boolean;

    can_delay: boolean;
}

export class LfgPlugin extends Plugin<ILfgPluginConfig> {

    public static pluginName = "lfg";
    private delay = [9999];
    private current_pos = 0;

    getDefaultOptions(): IPluginOptions<ILfgPluginConfig> {
        return {
            config: {
                lfg_command_ident: "!lfg",
                lfg_voice_ident: "team",
                lfg_text_ident: "lfg",
                lfg_message_compact: true,
                lfg_list_others: true,
                can_delay: false,
            },
            overrides: [
                {
                    level: ">=50",
                    config: {
                        can_delay: true,
                    },
                },
            ],
        };
    }

    @d.event("messageCreate", "guild", true)
    async lfgRequest(msg: Message) {

        let cfg = this.getConfig();
        let requestor = msg.member;
        let text = <TextChannel>this.bot.getChannel(msg.channel.id);
        logger.info(`${requestor.id}: ${requestor.username}#${requestor.discriminator} Started LFG request in ${text.name}`);
        const start = performance.now();
        if (text.name.toLowerCase().includes(cfg.lfg_text_ident.toLowerCase())) {

            //Why this weird german character: "ß"? Because [\s\S] didnt work
            let regex = new RegExp("^" + cfg.lfg_command_ident + "([^ß]|[ß])*$", "i");
            if (!isNullOrUndefined(msg.content.match(regex))) {

                if (checkForBlockedWords(msg.cleanContent)) {

                    try {

                        let voice = <VoiceChannel>this.bot.getChannel(requestor.voiceState.channelID);
                        regex = new RegExp("^([^ß]|[ß])*" + cfg.lfg_voice_ident + "([^ß]|[ß])*$", "i");
                        if (!isNullOrUndefined(voice.name.match(regex))) {

                            if (voice.voiceMembers.size >= voice.userLimit) {

                                let userMessage = msg.content.substring(cfg.lfg_command_ident.length).trim();
                                regex = new RegExp("`", "g");
                                userMessage = userMessage.replace(regex, "");

                                if (userMessage !== "") {
                                    if (cfg.lfg_message_compact) {
                                        userMessage = "`" + userMessage + "`";
                                    } else {
                                        userMessage = "```" + userMessage + "```";
                                    }
                                }

                                let toPost = await this.handleMessageCreation(voice, requestor.user, userMessage);
                                msg.channel.createMessage(toPost);

                                this.delay[this.current_pos] = performance.now() - start;
                                this.current_pos++;
                                if (this.current_pos >= 5) {
                                    this.current_pos = 0;
                                }

                            } else {
                                text.createMessage("Sorry, but that voice channel is full! " + requestor.mention);
                                logger.info(`${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Channel full`);
                            }

                        } else {
                            text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
                            logger.info(`${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Not in channel`);
                        }

                    } catch (error) {
                        text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
                        logger.info(`${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Not in channel`);
                    }

                } else {
                    logger.info(`${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: triggered word filter`);
                }

                msg.delete("LFG Request");

            }

        }

    }

    @d.command("delay")
    @d.permission("can_delay")
    async delayRequest(msg: Message) {

        if (this.delay.length > 1) {

            const highest = Math.round(Math.max(...this.delay));
            const lowest = Math.round(Math.min(...this.delay));
            const mean = Math.round(this.delay.reduce((t, v) => t + v, 0) / this.delay.length);

            msg.channel.createMessage(
                trimLines(`
      **LFG Delay:**
      Lowest: **${lowest}ms**
      Highest: **${highest}ms**
      Mean: **${mean}ms**
    `),
            );

        }

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested lfg delays`);
    }

    private async handleMessageCreation(vc: VoiceChannel, user: User, message: string) {

        let cfg = this.getConfig();
        let channelInfo = null;
        let invite = await createInvite(vc);

        if (invite !== null) {

            if (cfg.lfg_message_compact) {

                channelInfo = user.mention;

                if (cfg.lfg_list_others) {

                    let otherUsers = vc.voiceMembers;

                    otherUsers.forEach(vcUser => {
                        if (vcUser.id !== user.id) {

                            let nick = vcUser.nick;
                            if (nick === null) {
                                nick = vcUser.username;
                            }
                            channelInfo += " + " + nick;

                        }
                    });

                }

                //channelInfo += " in " + vc.name + ": " + message + " " + getInviteLink(invite);
                channelInfo += ` in ${vc.name}: ${message} ${getInviteLink(invite)}`;

            } else {

                channelInfo = "Join " + user.mention;

                if (cfg.lfg_list_others) {

                    let otherUsers = vc.voiceMembers;

                    otherUsers.forEach(vcUser => {
                        if (vcUser.id !== user.id) {

                            let nick = vcUser.nick;
                            if (nick === null) {
                                nick = vcUser.username;
                            }
                            channelInfo += " + " + nick;

                        }
                    });

                }

                //channelInfo += " in " + vc.name + " " + getInviteLink(invite) + "\n" + message;
                channelInfo += ` in ${vc.name} ${getInviteLink(invite)}\n${message}`;

            }

        }

        return channelInfo;
    }

}

export async function createInvite(vc: VoiceChannel) {

    let existingInvites = await vc.getInvites();

    if (existingInvites.length !== 0) {
        return existingInvites[0];
    } else {
        return vc.createInvite(undefined);
    }

}