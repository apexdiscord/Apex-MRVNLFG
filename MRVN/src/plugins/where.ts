import { decorators as d, IPluginOptions, Plugin, logger, getInviteLink } from "knub";
import { Message, TextableChannel, Member, Channel, VoiceChannel, Guild, User } from "eris";
import { isNullOrUndefined } from "util";
import { createInvite } from "./lfg";
import { UnknownUser, resolveMember } from "../utils";

interface IWherePluginConfig {
    where_timeout: number;

    can_where: boolean;
    can_notify: boolean;
}

export class WherePlugin extends Plugin<IWherePluginConfig> {

    public static pluginName = "where";
    private activeNotifications: Array<Notification> = [];

    getDefaultOptions(): IPluginOptions<IWherePluginConfig> {
        return {
            config: {
                where_timeout: 300,
                can_where: false,
                can_notify: false,
            },
            overrides: [
                {
                    level: ">=50",
                    config: {
                        can_where: true,
                        can_notify: true,
                    },
                },
            ],
        };
    }

    @d.command("where", "<user:resolvedUserLoose>", {
        aliases: ["w"],
    })
    @d.permission("can_where")
    async whereRequest(msg: Message, args: { user: User | UnknownUser }) {

        let member;
        if (!(args.user instanceof UnknownUser)) {
            member = await resolveMember(this.bot, this.guild, args.user.id);
        } else {
            this.sendErrorMessage(msg.channel, "Unknown user/member!");
        }

        sendWhere(this.guild, member, msg.channel, msg.author.mention + " ");

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested where for ${member.id}`);
    }

    @d.command("notify", "<user:resolvedUserLoose> [time:number]", {
        aliases: ["n"],
    })
    @d.permission("can_notify")
    async notifyRequest(msg: Message, args: { user: User | UnknownUser, time?: number }) {

        let member;
        if (!(args.user instanceof UnknownUser)) {
            member = await resolveMember(this.bot, this.guild, args.user.id);
        } else {
            this.sendErrorMessage(msg.channel, "Unknown user/member!");
        }

        const cfg = this.getConfig();
        const timeout = args.time != null ? args.time : cfg.where_timeout;

        const endTime = Date.now() + (timeout * 1000);
        this.activeNotifications.push(new Notification(msg.author.id, member.id, msg.channel.id, endTime));
        msg.channel.createMessage("If <@!" + member.id + "> joins or switches VC in the next " + timeout +
            " seconds, i will notify you");

        logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested notify for ${member.id}`);
    }

    @d.event("voiceChannelJoin")
    async userJoinedVC(member: Member, channel: Channel) {
        let active = false;

        this.activeNotifications.forEach(notif => {
            if (notif.subjectId === member.id) {

                if (notif.endTime >= Date.now()) {
                    sendWhere(this.guild, member, <TextableChannel>this.bot.getChannel(notif.channelId), "<@!" + notif.modId +
                        "> a notification requested by you has triggered:\n");
                }

                active = true;

            }
        });

        if (active) {
            this.removeNotifyforUserId(member.id);
        }

    }

    @d.event("voiceChannelSwitch")
    async userSwitchedVC(member: Member, newChannel: Channel, oldChannel: Channel) {
        let active = false;

        this.activeNotifications.forEach(notif => {
            if (notif.subjectId === member.id) {

                if (notif.endTime >= Date.now()) {
                    sendWhere(this.guild, member, <TextableChannel>this.bot.getChannel(notif.channelId), "<@!" + notif.modId +
                        "> a notification requested by you has triggered:\n");
                }

                active = true;

            }
        });

        if (active) {
            this.removeNotifyforUserId(member.id);
        }

    }

    async removeNotifyforUserId(userId: string) {
        let newNotifies: Array<Notification> = [];

        for (let index = 0; index < this.activeNotifications.length; index++) {
            const notif = this.activeNotifications[index];
            if (notif.subjectId !== userId) {
                newNotifies.push(notif);
            }
        }

        this.activeNotifications = newNotifies;

    }

}

export async function sendWhere(guild: Guild, member: Member, channel: TextableChannel, prepend?: string) {
    let voice = await <VoiceChannel>guild.channels.get(member.voiceState.channelID);

    if (isNullOrUndefined(voice)) {
        channel.createMessage(prepend + "That user is not in a channel");
    } else {
        let invite = await createInvite(voice);
        channel.createMessage(prepend + "<@!" + member.id + "> is in the following channel: " + voice.name + " https://" + getInviteLink(invite));
    }
}

class Notification {
    modId: string;
    subjectId: string;
    channelId: string;
    endTime: number;

    constructor(modId: string, subjectId: string, channelId: string, endTime: number) {
        this.modId = modId;
        this.subjectId = subjectId;
        this.channelId = channelId;
        this.endTime = endTime;
    }
}