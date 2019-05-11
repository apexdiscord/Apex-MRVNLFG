import { decorators as d, IPluginOptions, Plugin } from "knub";
import { Message, VoiceChannel, TextableChannel, Member, Channel } from "eris";
import { isNullOrUndefined } from "util";
import { createInvite } from "./lfg";

interface IWherePluginConfig {
    where_timeout: number;

    can_where: boolean;
    can_notify: boolean;
}

export class WherePlugin extends Plugin<IWherePluginConfig> {

    public static pluginName = "where";
    private activeNotifications: Array<Notification>;

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

    @d.command("where", "<whereId:string>", {
        aliases: ["w"],
    })
    //@d.permission("can_where")
    async whereRequest(msg: Message, args: { whereId: string }) {

        if (!isNullOrUndefined(args.whereId.match("^[0-9]*$"))) {
            sendWhere(args.whereId, msg.channel, msg.author.mention + " ");
        } else {
            msg.channel.createMessage(msg.author.mention + " please provide a valid userId");
        }

    }

    @d.command("notify", "<notifyId:string>", {
        aliases: ["n"],
    })
    //@d.permission("can_notify")
    async notifyRequest(msg: Message, args: {notifyId: string}) {
        let cfg = this.getConfig();

        if (!isNullOrUndefined(args.notifyId.match("^[0-9]*$"))) {

            this.activeNotifications.push(new Notification(msg.author.id, args.notifyId, msg.channel.id));
            msg.channel.createMessage("If <@!" + args.notifyId +"> joins or switches VC in the next " + cfg.where_timeout +
            " seconds, i will notify you");
            setTimeout(this.removeNotifyforUserId, cfg.where_timeout, args.notifyId);

        } else {
            msg.channel.createMessage(msg.author.mention + " please provide a valid userId");
        }

    }

    @d.event("voiceChannelJoin")
    async userJoinedVC(member: Member, channel: Channel) {
        let active = false;

        this.activeNotifications.forEach(notif => {
            if (notif.subjectId === member.id) {
                sendWhere(notif.subjectId, <TextableChannel>this.bot.getChannel(notif.channelId), "<@!" + notif.modId +
                "> a notification requested by you has triggered:\n");
                active = true;
            }
        });

        if (active) {
            this.removeNotifyforUserId(member.id);
        }

    }

    @d.event("voiceChannelSwitch")
    async userSwitchedVC(member: Member, newChannel: Channel, oldChannel: Channel) {

        this.activeNotifications.forEach(notif => {
            if (notif.subjectId === member.id) {
                sendWhere(notif.subjectId, <TextableChannel>this.bot.getChannel(notif.channelId), "<@!" + notif.modId +
                    "> a notification requested by you has triggered:\n");
            }
        });

    }

    async removeNotifyforUserId(userId: string) {
        let newNotifies = Array<Notification>();

        this.activeNotifications.forEach(notif => {
            if (notif.subjectId !== userId) {
                newNotifies.push(notif);
            }
        });

        this.activeNotifications = newNotifies;
        
    }

}

export async function voiceChannelForUserId(userId: string) {
    let member = await this.bot.getRESTGuildMember(this.guildId, userId);
    return <VoiceChannel>this.bot.getChannel(member.voiceState.channelID);
}

export async function sendWhere(userId: string, channel: TextableChannel, prepend ?: string) {
    let voice = await voiceChannelForUserId(userId);

    if (isNullOrUndefined(voice)) {
        channel.createMessage(prepend + "That user is not in a channel");
    } else {
        let invite = await createInvite(voice);
        channel.createMessage(prepend + "<@!" + userId + "> is in the following channel: " + voice.name + " discord.gg/" + invite.code);
    }
}

class Notification {
    modId: string;
    subjectId: string;
    channelId: string;

    constructor(modId : string, subjectId: string, channelId: string) {
        this.modId = modId;
        this.subjectId = subjectId;
        this.channelId = channelId;
    }
}