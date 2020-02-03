import Knub, { decorators as d, IPluginOptions, getInviteLink, Plugin, logger } from "knub";
import { Message, VoiceChannel, TextChannel, User, Member, Invite } from "eris";
import { isNullOrUndefined } from "util";
import { performance } from "perf_hooks";
import { trimLines } from "../utils";
import { passesFilter } from "../blockedWords";
import Eris = require("eris");

interface ILfgPluginConfig {
  lfg_command_ident: string;
  lfg_voice_ident: string;
  lfg_text_ident: string;
  lfg_message_compact: boolean;
  lfg_list_others: boolean;

  lfg_enable_ranked: boolean;
  lfg_ranked_chan_ident: string;
  lfg_ranked_emotes_idents: string[];
  lfg_ranked_emotes_names: string[];

  lfg_enable_shrink: boolean;
  lfg_shrink_text_idents: string[];
  lfg_shrink_normal_amt: number;
  lfg_shrink_shrunk_amt: number;
  lfg_unshrink_cmd_ident: string;

  can_delay: boolean;
}

export class LfgPlugin extends Plugin<ILfgPluginConfig> {
  public static pluginName = "lfg";
  private delay = [];
  private current_pos = 0;

  getDefaultOptions(): IPluginOptions<ILfgPluginConfig> {
    return {
      config: {
        lfg_command_ident: "!lfg",
        lfg_voice_ident: "lfg",
        lfg_text_ident: "lfg",
        lfg_message_compact: true,
        lfg_list_others: true,

        lfg_enable_ranked: false,
        lfg_ranked_chan_ident: "ranked",
        lfg_ranked_emotes_idents: ["examplename1", "examplename2"],
        lfg_ranked_emotes_names: ["<:test2:671473369891340293>", "<:testEmoji:608348601575407661>"],

        lfg_enable_shrink: false,
        lfg_shrink_text_idents: ["duo", "1v1"],
        lfg_shrink_normal_amt: 3,
        lfg_shrink_shrunk_amt: 2,
        lfg_unshrink_cmd_ident: "!unshrink",

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
  async lfgRequest(msg: Message): Promise<void> {
    let cfg: ILfgPluginConfig = this.getConfig();
    let requestor: Member = msg.member;
    let text: TextChannel = <TextChannel>this.bot.getChannel(msg.channel.id);
    const start: any = performance.now();

    if (text.name.toLowerCase().includes(cfg.lfg_text_ident.toLowerCase())) {
      // why this weird german character: "ß"? Because [\s\S] didnt work
      let regex: RegExp = new RegExp("^" + cfg.lfg_command_ident + "([^ß]|[ß])*$", "i");
      if (!isNullOrUndefined(msg.content.match(regex))) {
        logger.info(
          `${requestor.id}: ${requestor.username}#${requestor.discriminator} Started LFG request in ${text.name}`,
        );
        if (passesFilter(msg.cleanContent)) {
          try {
            let voice: VoiceChannel = <VoiceChannel>this.bot.getChannel(requestor.voiceState.channelID);
            regex = new RegExp("^([^ß]|[ß])*" + cfg.lfg_voice_ident + "([^ß]|[ß])*$", "i");
            if (!isNullOrUndefined(voice.name.match(regex))) {
              const voiceLimit: any = voice.userLimit > 0 ? voice.userLimit : 999;
              if (voice.voiceMembers.size < voiceLimit) {
                let userMessage: string = msg.content.substring(cfg.lfg_command_ident.length).trim();

                if (userMessage.length <= 275) {
                  regex = new RegExp("`", "g");
                  userMessage = userMessage.replace(regex, "");

                  if (userMessage !== "") {
                    if (cfg.lfg_message_compact) {
                      userMessage = "`" + userMessage + "`";
                    } else {
                      userMessage = "```" + userMessage + "```";
                    }
                  }

                  let ranked: boolean = false;
                  if (cfg.lfg_enable_ranked) {
                    ranked = text.name.includes(cfg.lfg_ranked_chan_ident);
                  }

                  try {
                    await msg.channel.getMessage(msg.id);
                  } catch (error) {
                    logger.info(
                      `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Source message not found (${msg.id}). It was probably deleted.`,
                    );
                    return;
                  }

                  if (cfg.lfg_enable_shrink) {
                    let shrink: boolean = false;
                    for (let i: any = 0; i < cfg.lfg_shrink_text_idents.length; i++) {
                      if (userMessage.includes(cfg.lfg_shrink_text_idents[i])) {
                        shrink = true;
                        break;
                      }
                    }

                    if (shrink) {
                      voice.edit({ userLimit: cfg.lfg_shrink_shrunk_amt });
                    } else {
                      voice.edit({ userLimit: cfg.lfg_shrink_normal_amt });
                    }
                  }

                  let toPost: any = await this.handleMessageCreation(voice, requestor.user, userMessage, ranked);
                  msg.channel.createMessage(toPost);

                  logger.info(
                    `${requestor.id}: ${requestor.username}#${requestor.discriminator} Succesfully completed LFG request`,
                  );

                  this.delay[this.current_pos] = performance.now() - start;
                  this.current_pos++;
                  if (this.current_pos >= 5) {
                    this.current_pos = 0;
                  }
                } else {
                  text.createMessage("Sorry, but that message is too long! " + requestor.mention);
                  logger.info(
                    `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Message length = ${userMessage.length}`,
                  );
                }
              } else {
                text.createMessage("Sorry, but that voice channel is full! " + requestor.mention);
                logger.info(
                  `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Channel full`,
                );
              }
            } else {
              text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
              logger.info(
                `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Not in channel`,
              );
            }
          } catch (error) {
            text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
            // tslint:disable-next-line: max-line-length
            logger.info(
              `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Not in channel`,
            );
          }
        } else {
          logger.info(
            `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: triggered word filter`,
          );
        }

        try {
          await msg.delete("LFG Request");
        } catch (error) {
          logger.error(`Failed to delete source message (${msg.id}). It was probably deleted or we had a timeout`);
          logger.error(error);
        }
      }
    }
  }

  @d.event("voiceChannelLeave", "guild", true)
  async resetChannelLimitLeave(member: Member, vc: VoiceChannel): Promise<any> {
    let cfg: ILfgPluginConfig = this.getConfig();

    if (
      cfg.lfg_enable_shrink &&
      vc.voiceMembers.size === 0 &&
      vc.userLimit !== cfg.lfg_shrink_normal_amt &&
      vc.name.toLowerCase().includes(cfg.lfg_voice_ident)
    ) {
      vc.edit({ userLimit: cfg.lfg_shrink_normal_amt });
    }
  }

  @d.event("voiceChannelSwitch", "guild", true)
  async resetChannelLimitSwitch(member: Member, newVC: VoiceChannel, oldVC: VoiceChannel): Promise<any> {
    let cfg: ILfgPluginConfig = this.getConfig();

    if (
      cfg.lfg_enable_shrink &&
      oldVC.voiceMembers.size === 0 &&
      oldVC.userLimit !== cfg.lfg_shrink_normal_amt &&
      oldVC.name.toLowerCase().includes(cfg.lfg_voice_ident)
    ) {
      oldVC.edit({ userLimit: cfg.lfg_shrink_normal_amt });
    }
  }

  @d.command("delay")
  @d.permission("can_delay")
  async delayRequest(msg: Message): Promise<void> {
    if (this.delay.length > 1) {
      const highest: any = Math.round(Math.max(...this.delay));
      const lowest: any = Math.round(Math.min(...this.delay));
      const mean: any = Math.round(this.delay.reduce((t, v) => t + v, 0) / this.delay.length);

      msg.channel.createMessage(
        trimLines(`
      **LFG Delay:**
      Lowest: **${lowest}ms**
      Highest: **${highest}ms**
      Mean: **${mean}ms**
    `),
      );
    } else {
      this.sendErrorMessage(msg.channel, "No LFG requests yet, cannot display delays!");
    }

    logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested lfg delays`);
  }

  private async handleMessageCreation(vc: VoiceChannel, user: User, message: string, ranked: boolean): Promise<any> {
    let cfg: ILfgPluginConfig = this.getConfig();
    let channelInfo: string = null;
    let invite: Invite = await createInvite(vc);

    if (invite !== null) {
      if (cfg.lfg_message_compact) {
        channelInfo = user.mention;

        if (cfg.lfg_list_others) {
          let otherUsers: Eris.Collection<Member> = vc.voiceMembers;

          otherUsers.forEach(vcUser => {
            if (vcUser.id !== user.id) {
              let nick: string = vcUser.nick;
              if (nick === null) {
                nick = vcUser.username;
              }
              channelInfo += " + " + nick;
            }
          });
        }

        channelInfo += ` in ${vc.name}: ${message} ${getInviteLink(invite)}`;
      } else {
        channelInfo = "Join " + user.mention;

        if (cfg.lfg_list_others) {
          let otherUsers: Eris.Collection<Member> = vc.voiceMembers;

          otherUsers.forEach(vcUser => {
            if (vcUser.id !== user.id) {
              let nick: string = vcUser.nick;
              if (nick === null) {
                nick = vcUser.username;
              }
              channelInfo += " + " + nick;
            }
          });
        }

        channelInfo += ` in ${vc.name} ${getInviteLink(invite)}\n${message}`;
      }
    }

    if (ranked && cfg.lfg_enable_ranked) {
      let rankEmoji: string = "";
      let firstRank: boolean = true;

      const idents: string[] = cfg.lfg_ranked_emotes_idents;
      const emotes: string[] = cfg.lfg_ranked_emotes_names;

      for (let i: number = 0; i < idents.length; i++) {
        if (message.toLowerCase().includes(idents[i])) {
          if (firstRank) {
            firstRank = false;
            rankEmoji = "\n** Ranks in this message: **";
          }

          rankEmoji += `${emotes[i]} `;
        }
      }

      if (firstRank) {
        rankEmoji = "\n**No ranks in this message**";
      }

      channelInfo += rankEmoji;
    }

    return channelInfo;
  }
}

export async function createInvite(vc: VoiceChannel): Promise<Invite> {
  let existingInvites: Invite[] = await vc.getInvites();

  if (existingInvites.length !== 0) {
    return existingInvites[0];
  } else {
    return vc.createInvite(undefined);
  }
}
