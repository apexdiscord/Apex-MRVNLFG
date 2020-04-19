import {
  AnyGuildChannel,
  Channel,
  Collection,
  Guild,
  Invite,
  Member,
  Message,
  TextableChannel,
  User,
  VoiceChannel,
} from "eris";
import humanizeDuration from "humanize-duration";
import { decorators as d, getInviteLink, IPluginOptions, logger, Plugin } from "knub";
import moment from "moment-timezone";
import { errorMessage, resolveMember, successMessage, UnknownUser } from "../utils";
import { createInvite } from "./lfg";
import { UtilityPlugin } from "./utility";

interface IWherePluginConfig {
  where_timeout: number;
  update_notification: boolean;

  can_where: boolean;
  can_notify: boolean;
  can_follow: boolean;
  can_usage: boolean;
}

class Notification {
  modId: string;
  subjectId: string;
  channelId: string;
  endTime: number;
  persist: boolean;
  activeFollow: boolean;

  constructor(
    modId: string,
    subjectId: string,
    channelId: string,
    endTime: number,
    persist: boolean,
    activeFollow: boolean,
  ) {
    this.modId = modId;
    this.subjectId = subjectId;
    this.channelId = channelId;
    this.endTime = endTime;
    this.persist = persist;
    this.activeFollow = activeFollow;
  }
}

enum ChannelType {
  TextChannel = 0,
  // eslint-disable-next-line no-shadow
  VoiceChannel = 2,
  Category = 4,
}

export class WherePlugin extends Plugin<IWherePluginConfig> {
  public static pluginName = "where";
  private activeNotifications: Notification[] = [];
  private activeVCNotifications: Notification[] = [];

  getDefaultOptions(): IPluginOptions<IWherePluginConfig> {
    return {
      config: {
        where_timeout: 600000,
        update_notification: true,

        can_where: false,
        can_notify: false,
        can_follow: false,
        can_usage: false,
      },
      overrides: [
        {
          level: ">=50",
          config: {
            can_where: true,
            can_notify: true,
            can_follow: true,
            can_usage: true,
          },
        },
      ],
    };
  }

  @d.command("where", "<user:resolvedUserLoose>", {
    aliases: ["w"],
  })
  @d.permission("can_where")
  async whereRequest(msg: Message, args: { user: User | UnknownUser }): Promise<void> {
    let member: Member;
    if (!(args.user instanceof UnknownUser)) {
      // member = await resolveMember(this.bot, this.guild, args.user.id);
      try {
        member = await this.bot.getRESTGuildMember(this.guildId, args.user.id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    } else {
      this.sendErrorMessage(msg.channel, "Unknown user/member! Is the ID correct?");
      return;
    }

    let newVer: string = "";
    if (UtilityPlugin.NEW_AVAILABLE && this.getConfig().update_notification) {
      newVer = `⚙️ New bot version available! Version **${UtilityPlugin.NEWEST_VERSION}**\n`;
    }

    sendWhere(this.guild, member, msg.channel, newVer + msg.author.mention + " ");

    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested where for ${member.id}`,
    );
  }

  @d.command("notify", "<user:resolvedUserLoose> [time:delay]", {
    aliases: ["n"],
  })
  @d.permission("can_notify")
  async notifyRequest(msg: Message, args: { user: User | UnknownUser; time?: number }): Promise<void> {
    let member: Member;
    if (!(args.user instanceof UnknownUser)) {
      member = await resolveMember(this.bot, this.guild, args.user.id);
    } else {
      this.sendErrorMessage(msg.channel, "Unknown user/member! Is the ID correct?");
      return;
    }

    const cfg: IWherePluginConfig = this.getConfig();
    const timeout: any = args.time != null ? args.time : cfg.where_timeout;

    const endTime: any = moment().add(timeout, "ms");
    this.activeNotifications.push(new Notification(msg.author.id, member.id, msg.channel.id, endTime, false, false));
    msg.channel.createMessage(
      `If <@!${member.id}> joins or switches VC in the next ${humanizeDuration(timeout)} i will notify you`,
    );

    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested notify for ${member.id}`,
    );
  }

  @d.command("vcnotify", "<channelId:string> [time:delay]", {
    aliases: ["v", "vc", "vcn"],
  })
  @d.permission("can_notify")
  async vcNotifyRequest(msg: Message, args: { channelId: string; time?: number }): Promise<void> {
    const cfg: IWherePluginConfig = this.getConfig();
    const timeout: any = args.time != null ? args.time : cfg.where_timeout;

    const channel: VoiceChannel = this.bot.getChannel(args.channelId) as VoiceChannel;
    if (channel == null) {
      this.sendErrorMessage(msg.channel, "Couldnt find channel");
      return;
    }

    const endTime: any = moment().add(timeout, "ms");
    this.activeVCNotifications.push(
      new Notification(msg.author.id, args.channelId, msg.channel.id, endTime, false, false),
    );
    msg.channel.createMessage(
      `I will notify you of all changes in \`${channel.name}\` for the next ${humanizeDuration(timeout)}`,
    );

    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested notify for vc ${args.channelId}`,
    );
  }

  @d.command("follow", "<user:resolvedUserLoose> [time:delay]", {
    aliases: ["f"],
    options: [
      {
        name: "active",
        isSwitch: true,
        shortcut: "a",
      },
    ],
  })
  @d.permission("can_follow")
  async followRequest(
    msg: Message,
    args: { user: User | UnknownUser; time?: number; active?: boolean },
  ): Promise<void> {
    const cfg: IWherePluginConfig = this.getConfig();
    const timeout: any = args.time != null ? args.time : cfg.where_timeout;
    const active: boolean = args.active != null ? args.active : false;

    let member: Member;
    if (!(args.user instanceof UnknownUser)) {
      member = await resolveMember(this.bot, this.guild, args.user.id);
    } else {
      this.sendErrorMessage(msg.channel, "Unknown user/member! Is the ID correct?");
      return;
    }

    const endTime: any = moment().add(timeout, "ms");
    this.activeNotifications.push(new Notification(msg.author.id, member.id, msg.channel.id, endTime, true, active));

    if (!active) {
      msg.channel.createMessage(
        `I will let you know each time <@!${member.id}> switches channel in the next ${humanizeDuration(timeout)}`,
      );
    } else {
      msg.channel.createMessage(
        `I will let you know each time <@!${member.id}> switches channel in the next ${humanizeDuration(
          timeout,
        )}.\nI will also move you to the users channel, please join a voice channel now so that i can move you!`,
      );
    }

    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested follow for ${member.id} - Active Follow: ${active}`,
    );
  }

  @d.command("follow stop", "<user:resolvedUserLoose>", {
    aliases: ["fs", "fd", "ns", "nd"],
  })
  @d.permission("can_follow")
  async followStopRequest(msg: Message, args: { user: User | UnknownUser }): Promise<void> {
    this.removeNotifyforUserId(args.user.id);
    msg.channel.createMessage(successMessage(`Deleted all your follow and notify requests for <@!${args.user.id}>!`));
    logger.info(
      `${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested notify/follow deletion for ${args.user.id}`,
    );
  }

  @d.cooldown(30 * 1000)
  @d.command("voice_usage", "", {
    aliases: ["voiceusage", "vu"],
  })
  @d.permission("can_usage")
  async voiceUsageRequest(msg: Message): Promise<void> {
    const channels: Collection<AnyGuildChannel> = this.guild.channels;
    const channelMap: Map<AnyGuildChannel, string> = new Map();
    const categories: AnyGuildChannel[] = [];

    channels.forEach((ch) => {
      if (ChannelType[ch.type] === "VoiceChannel") {
        channelMap.set(ch, ch.parentID);
      } else if (ChannelType[ch.type] === "Category") {
        categories.push(ch);
      }
    });
    const col: Intl.Collator = new Intl.Collator(undefined, { numeric: true, sensitivity: `base` });
    categories.sort((a, b) => col.compare(a.name, b.name));

    let reply: string = "Channel usage:";

    for (const cat of categories) {
      const catChannels: AnyGuildChannel[] = [...channelMap.entries()]
        .filter(({ 1: id }) => id === cat.id)
        .map(([k]) => k);
      if (catChannels.length === 0) {
        continue;
      }

      let freeAmt: number = 0;
      catChannels.forEach((ch) => {
        const vc: VoiceChannel = this.bot.getChannel(ch.id) as VoiceChannel;
        if (vc.voiceMembers.size === 0) {
          freeAmt++;
        }
      });

      reply += `\n__${cat.name}__: **${freeAmt}** of **${catChannels.length}** free`;
    }

    msg.channel.createMessage(reply);

    logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested current VC usage`);
  }

  @d.event("voiceChannelJoin")
  async userJoinedVC(member: Member, newChannel: Channel): Promise<void> {
    let obsolete: boolean = false;

    this.activeNotifications.forEach(async (notif) => {
      if (notif.subjectId === member.id) {
        if (notif.endTime >= Date.now()) {
          const channel: TextableChannel = this.bot.getChannel(notif.channelId) as TextableChannel;
          sendWhere(
            this.guild,
            member,
            channel,
            "<@!" + notif.modId + "> a notification requested by you has triggered:\n",
          );

          if (notif.activeFollow) {
            const modMember: Member = await this.bot.getRESTGuildMember(this.guildId, notif.modId);
            if (modMember.voiceState.channelID != null) {
              try {
                await modMember.edit({
                  channelID: newChannel.id,
                });
              } catch (e) {
                channel.createMessage(errorMessage("Failed to move you. Are you in a voice channel?"));
                return;
              }
            }
          }

          if (!notif.persist) {
            obsolete = true;
          }
        } else {
          obsolete = true;
        }
      }
    });

    if (obsolete) {
      this.removeNotifyforUserId(member.id);
    }

    obsolete = false;
    this.activeVCNotifications.forEach((notif) => {
      if (notif.subjectId === newChannel.id) {
        if (Date.now() >= notif.endTime) {
          obsolete = true;
        } else {
          const text: TextableChannel = this.bot.getChannel(notif.channelId) as TextableChannel;
          const voice: VoiceChannel = this.bot.getChannel(notif.subjectId) as VoiceChannel;
          text.createMessage(`🔵 <@!${notif.modId}> The user <@!${member.id}> joined the channel \`${voice.name}\``);
        }
      }
    });

    if (obsolete) {
      this.removeVCNotifyforChannelId(member.id);
    }
  }

  @d.event("voiceChannelSwitch")
  async userSwitchedVC(member: Member, newChannel: Channel, oldChannel: Channel): Promise<void> {
    let obsolete = false;
    const newVoice = this.bot.getChannel(newChannel.id) as VoiceChannel;
    const oldVoice = this.bot.getChannel(oldChannel.id) as VoiceChannel;

    this.activeNotifications.forEach(async (notif) => {
      if (notif.subjectId === member.id) {
        if (notif.endTime >= Date.now()) {
          const channel = this.bot.getChannel(notif.channelId) as TextableChannel;
          sendWhere(
            this.guild,
            member,
            channel,
            "<@!" + notif.modId + "> a notification requested by you has triggered:\n",
          );

          if (notif.activeFollow) {
            const modMember: Member = await this.bot.getRESTGuildMember(this.guildId, notif.modId);
            if (modMember.voiceState.channelID != null) {
              try {
                await modMember.edit({
                  channelID: newChannel.id,
                });
              } catch (e) {
                channel.createMessage(errorMessage("Failed to move you. Are you in a voice channel?"));
                return;
              }
            }
          }

          if (!notif.persist) {
            obsolete = true;
          }
        } else {
          obsolete = true;
        }
      }
    });

    if (obsolete) {
      this.removeNotifyforUserId(member.id);
    }

    obsolete = false;
    this.activeVCNotifications.forEach((notif) => {
      if (notif.subjectId === newChannel.id) {
        if (Date.now() >= notif.endTime) {
          obsolete = true;
        } else {
          const text = this.bot.getChannel(notif.channelId) as TextableChannel;
          text.createMessage(
            `🔵 <@!${notif.modId}> The user <@!${member.id}> switched to the channel \`${newVoice.name}\` from \`${oldVoice.name}\``,
          );
        }
      }
    });

    this.activeVCNotifications.forEach((notif) => {
      if (notif.subjectId === oldChannel.id) {
        if (Date.now() >= notif.endTime) {
          obsolete = true;
        } else {
          const text = this.bot.getChannel(notif.channelId) as TextableChannel;
          text.createMessage(
            `🔴 <@!${notif.modId}> The user <@!${member.id}> switched out of the channel \`${oldVoice.name}\` and joined \`${newVoice.name}\``,
          );
        }
      }
    });

    if (obsolete) {
      this.removeVCNotifyforChannelId(member.id);
    }
  }

  @d.event("voiceChannelLeave")
  async userLeftVC(member: Member, channel: Channel): Promise<void> {
    let obsolete: boolean = false;

    this.activeVCNotifications.forEach((notif) => {
      if (notif.subjectId === channel.id) {
        if (Date.now() >= notif.endTime) {
          obsolete = true;
        } else {
          const text = this.bot.getChannel(notif.channelId) as TextableChannel;
          const voice = this.bot.getChannel(notif.subjectId) as VoiceChannel;
          text.createMessage(
            `🔴 <@!${notif.modId}> The user <@!${member.id}> disconnected out of the channel \`${voice.name}\``,
          );
        }
      }
    });

    if (obsolete) {
      this.removeVCNotifyforChannelId(member.id);
    }

    this.activeNotifications.forEach(async (notif) => {
      if (notif.subjectId === member.id) {
        if (notif.endTime >= Date.now()) {
          if (notif.persist) {
            const tchannel = this.bot.getChannel(notif.channelId) as TextableChannel;
            const voice = this.bot.getChannel(channel.id) as VoiceChannel;
            tchannel.createMessage(
              `<@!${notif.modId}> The user <@!${member.id}> disconnected out of the channel \`${voice.name}\``,
            );
          }
        } else {
          obsolete = true;
        }
      }
    });

    if (obsolete) {
      this.removeNotifyforUserId(member.id);
    }
  }

  @d.event("guildBanAdd")
  async onGuildBanAdd(_: any, user: User): Promise<void> {
    this.removeNotifyforUserId(user.id);
  }

  async removeNotifyforUserId(userId: string): Promise<void> {
    const newNotifies: Notification[] = [];

    for (const notif of this.activeNotifications) {
      if (notif.subjectId !== userId) {
        newNotifies.push(notif);
      }
    }

    this.activeNotifications = newNotifies;
  }

  async removeVCNotifyforChannelId(userId: string): Promise<void> {
    const newNotifies: Notification[] = [];

    for (const notif of this.activeVCNotifications) {
      if (notif.subjectId !== userId) {
        newNotifies.push(notif);
      }
    }

    this.activeVCNotifications = newNotifies;
  }
}

export async function sendWhere(
  guild: Guild,
  member: Member,
  channel: TextableChannel,
  prepend?: string,
): Promise<void> {
  let voice: VoiceChannel = null;
  try {
    voice = guild.channels.get(member.voiceState.channelID) as VoiceChannel;
  } catch (e) {
    channel.createMessage(errorMessage("Could not retrieve information on that user!\nAre they on the server?"));
    return;
  }

  if (voice == null) {
    channel.createMessage(prepend + "That user is not in a channel");
  } else {
    let invite: Invite = null;
    try {
      invite = await createInvite(voice);
    } catch (e) {
      channel.createMessage(errorMessage(`Could not create an invite to that channel!\nReason: \`${e}\``));
      logger.info(`${e}\nGuild: ${guild.name}\nMember: ${member.id}\nPrepend: ${prepend}`);
      return;
    }
    channel.createMessage(
      `${prepend}<@!${member.id}> is in the following channel: \`${voice.name}\` ${getInviteLink(invite)}`,
    );
  }
}
